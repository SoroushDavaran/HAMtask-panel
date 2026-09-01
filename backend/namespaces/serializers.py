from rest_framework import serializers
from .models import Namespace
from clusters.models import Cluster

class NamespaceSerializer(serializers.ModelSerializer):
    cluster_id = serializers.PrimaryKeyRelatedField(
        queryset=Cluster.objects.all(),
        source='cluster',
        write_only=True
    )

    class Meta:
        model = Namespace
        fields = ['id', 'name', 'cluster_id', 'created_at']