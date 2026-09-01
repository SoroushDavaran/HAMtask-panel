from django.urls import path
from .views import NamespaceDeleteView, NamespaceListCreateView

urlpatterns = [
    path('namespaces/', NamespaceListCreateView.as_view(), name='namespace-list-create'),
    path('namespaces/<int:pk>/', NamespaceDeleteView.as_view(), name='namespace-delete'),
]