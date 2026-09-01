from rest_framework import serializers
from .models import Cluster

class ClusterSerializer(serializers.ModelSerializer):
    namespace_count = serializers.SerializerMethodField()

    class Meta:
        model = Cluster
        fields = ['id', 'name', 'address', 'token', 'created_at', 'namespace_count']
        extra_kwargs = {
            'token': {'write_only': True}
        }

    def get_namespace_count(self, obj):
        return obj.namespaces.count()