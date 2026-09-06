from rest_framework import generics
from .models import Cluster
from .serializers import ClusterSerializer
from k8sbackend.metrics import track_operation


class ClusterListCreateView(generics.ListCreateAPIView):
    queryset = Cluster.objects.all()
    serializer_class = ClusterSerializer

    def list(self, request, *args, **kwargs):
        with track_operation(resource="cluster", operation="list"):
            return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        with track_operation(resource="cluster", operation="create"):
            return super().create(request, *args, **kwargs)