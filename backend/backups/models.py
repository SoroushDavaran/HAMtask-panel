import uuid
from django.db import models
from apps.models import App


def generate_backup_id():
    return f"bkp_{uuid.uuid4().hex[:6]}"


class BackupSchedule(models.Model):
    """تعریف یک Backup دوره‌ای؛ خودش هیچوقت مستقیم backup تولید نمی‌کنه،
    فقط الگوییه که Celery Beat طبقش هر بار یک Backup جدید می‌سازه."""
    app = models.ForeignKey(App, on_delete=models.CASCADE, related_name='backup_schedules')
    source_path = models.CharField(max_length=500)
    cron_expression = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"schedule for {self.app.name}: {self.cron_expression}"


class Backup(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        RUNNING = 'running', 'Running'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    backup_id = models.CharField(
        max_length=20, unique=True, db_index=True,
        default=generate_backup_id, editable=False,
    )
    app = models.ForeignKey(App, on_delete=models.CASCADE, related_name='backups')
    source_path = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    output_path = models.CharField(max_length=500, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    # اگه این backup محصول یک زمان‌بندیه، به همون schedule اشاره می‌کنه؛ وگرنه null یعنی فوری بوده
    schedule = models.ForeignKey(
        BackupSchedule, on_delete=models.SET_NULL, null=True, blank=True, related_name='backups'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.backup_id} ({self.status})"