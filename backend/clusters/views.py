from rest_framework import generics
from .models import Cluster
from .serializers import ClusterSerializer

class ClusterListCreateView(generics.ListCreateAPIView):
    queryset = Cluster.objects.all()
    serializer_class = ClusterSerializer