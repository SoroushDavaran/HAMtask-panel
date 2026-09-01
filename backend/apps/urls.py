from django.urls import path
from .views import AppListCreateView, AppUpdateDeleteView

urlpatterns = [
    path('apps/', AppListCreateView.as_view(), name='app-list-create'),
    path('apps/<int:pk>/', AppUpdateDeleteView.as_view(), name='app-update-delete'),
]