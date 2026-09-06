from datetime import timedelta
import time
from celery import shared_task
from celery.exceptions import SoftTimeLimitExceeded
from django.utils import timezone

from .models import Backup, BackupSchedule
from apps.k8s_utils import get_one_pod_name, exec_backup_in_pod
from k8sbackend.metrics import backup_jobs_total, backup_duration_seconds, backups_in_progress


@shared_task(bind=True, max_retries=3, time_limit=600, soft_time_limit=570)
def run_backup(self, backup_id):
    try:
        backup = Backup.objects.get(pk=backup_id)
    except Backup.DoesNotExist:
        return

    backup.status = Backup.Status.RUNNING
    backup.save(update_fields=['status', 'updated_at'])

    app = backup.app
    namespace = app.namespace

    backups_in_progress.inc()
    start = time.monotonic()

    try:
        pod_name = get_one_pod_name(namespace.cluster, namespace.name, app.name)

        date_str = timezone.now().strftime('%Y-%m-%d')
        output_path = f"/backups/{app.id}/{date_str}/{backup.backup_id}.tar.gz"

        exec_backup_in_pod(
            namespace.cluster, namespace.name, pod_name,
            backup.source_path, output_path
        )

        backup.status = Backup.Status.COMPLETED
        backup.output_path = output_path
        backup.save(update_fields=['status', 'output_path', 'updated_at'])
        backup_jobs_total.labels(outcome="completed").inc()

    except SoftTimeLimitExceeded:
        backup.status = Backup.Status.FAILED
        backup.error_message = "Backup timed out after 570 seconds"
        backup.save(update_fields=['status', 'error_message', 'updated_at'])
        backup_jobs_total.labels(outcome="failed").inc()

    except Exception as exc:
        if self.request.retries < self.max_retries:
            backup.status = Backup.Status.PENDING
            backup.error_message = f"Retry {self.request.retries + 1}/{self.max_retries}: {exc}"
            backup.save(update_fields=['status', 'error_message', 'updated_at'])
            # این تلاش هنوز نتیجه‌ی نهایی نیست، پس هنوز به counter اضافه نمی‌کنیم
            raise self.retry(exc=exc, countdown=30 * (self.request.retries + 1))
        else:
            backup.status = Backup.Status.FAILED
            backup.error_message = str(exc)
            backup.save(update_fields=['status', 'error_message', 'updated_at'])
            backup_jobs_total.labels(outcome="failed").inc()

    finally:
        backup_duration_seconds.observe(time.monotonic() - start)
        backups_in_progress.dec()


@shared_task
def run_scheduled_backup(schedule_id):
    """این Task رو خود Celery Beat، طبق Cron Expression، صدا می‌زنه.
    هر بار یک Backup مستقل و جدید می‌سازه."""
    try:
        schedule_obj = BackupSchedule.objects.get(pk=schedule_id)
    except BackupSchedule.DoesNotExist:
        return

    backup = Backup.objects.create(
        app=schedule_obj.app,
        source_path=schedule_obj.source_path,
        schedule=schedule_obj,
    )
    run_backup.delay(backup.pk)


@shared_task
def check_stale_backups():
    """این Task باید دوره‌ای (مثلاً هر ۳۰ دقیقه) توسط Celery Beat اجرا بشه.
    Backupهایی که بیش از ۲۴ ساعت pending موندن رو failed می‌کنه."""
    cutoff = timezone.now() - timedelta(hours=24)
    stale = Backup.objects.filter(status=Backup.Status.PENDING, created_at__lt=cutoff)
    updated = stale.update(status=Backup.Status.FAILED, error_message="Timed out after 24h in pending state")
    if updated:
        backup_jobs_total.labels(outcome="failed").inc(updated)
    return updated