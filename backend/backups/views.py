import json
from rest_framework import generics, status as http_status
from rest_framework.response import Response
from django_celery_beat.models import PeriodicTask, CrontabSchedule

from .models import Backup, BackupSchedule
from .serializers import BackupCreateSerializer, BackupDetailSerializer, BackupListItemSerializer
from .tasks import run_backup


class BackupListCreateView(generics.ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BackupCreateSerializer
        return BackupListItemSerializer

    def get_queryset(self):
        app_id = self.request.query_params.get('app_id')
        if not app_id:
            return Backup.objects.none()
        return Backup.objects.filter(app_id=app_id).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        app = serializer.validated_data['app_id']
        source_path = serializer.validated_data['source_path']
        cron_expr = serializer.validated_data.get('schedule')

        if cron_expr:
            schedule_obj = BackupSchedule.objects.create(
                app=app, source_path=source_path, cron_expression=cron_expr
            )
            self._register_periodic_task(schedule_obj)
            return Response(
                {"schedule_id": schedule_obj.id, "status": "scheduled"},
                status=http_status.HTTP_201_CREATED
            )

        backup = Backup.objects.create(app=app, source_path=source_path)
        run_backup.delay(backup.pk)
        return Response(
            {"backup_id": backup.backup_id, "status": backup.status},
            status=http_status.HTTP_202_ACCEPTED
        )

    def _register_periodic_task(self, schedule_obj):
        minute, hour, day_of_month, month, day_of_week = schedule_obj.cron_expression.split()
        crontab, _ = CrontabSchedule.objects.get_or_create(
            minute=minute, hour=hour, day_of_month=day_of_month,
            month_of_year=month, day_of_week=day_of_week,
        )
        PeriodicTask.objects.create(
            crontab=crontab,
            name=f"backup-schedule-{schedule_obj.id}",
            task='backups.tasks.run_scheduled_backup',
            args=json.dumps([schedule_obj.id]),
        )


class BackupDetailView(generics.RetrieveAPIView):
    queryset = Backup.objects.all()
    serializer_class = BackupDetailSerializer
    lookup_field = 'backup_id'