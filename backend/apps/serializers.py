from rest_framework import serializers
from .models import App
from namespaces.models import Namespace
from .k8s_utils import get_app_pods_status


class AppSerializer(serializers.ModelSerializer):
    namespace_id = serializers.PrimaryKeyRelatedField(
        queryset=Namespace.objects.all(),
        source='namespace',
        write_only=True
    )
    pods = serializers.SerializerMethodField()

    class Meta:
        model = App
        fields = [
            'id', 'name', 'namespace_id', 'image',
            'replicas', 'cpu', 'memory', 'pods', 'created_at'
        ]

    def get_pods(self, obj):
        cluster = obj.namespace.cluster
        namespace_name = obj.namespace.name
        try:
            return get_app_pods_status(cluster, namespace_name, obj.name)
        except Exception:
            # اگه کلاستر موقتاً در دسترس نبود، کل Response رو خراب نکنیم
            return []