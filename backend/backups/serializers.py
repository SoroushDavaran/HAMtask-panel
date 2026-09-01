from rest_framework import serializers
from .models import Backup
from apps.models import App


class BackupCreateSerializer(serializers.Serializer):
    app_id = serializers.PrimaryKeyRelatedField(queryset=App.objects.all())
    source_path = serializers.CharField(max_length=500)
    schedule = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)


class BackupDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backup
        fields = ['backup_id', 'app', 'status', 'source_path', 'output_path', 'error_message', 'created_at', 'updated_at']


class BackupListItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backup
        fields = ['backup_id', 'status']