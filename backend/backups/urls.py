from django.urls import path
from .views import BackupListCreateView, BackupDetailView

urlpatterns = [
    path('backup', BackupListCreateView.as_view(), name='backup-list-create'),
    path('backup/<str:backup_id>', BackupDetailView.as_view(), name='backup-detail'),
]