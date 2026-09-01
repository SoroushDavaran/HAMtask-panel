import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'k8sbackend.settings')

app = Celery('k8sbackend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()