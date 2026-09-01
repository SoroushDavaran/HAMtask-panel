from django.db import models
from clusters.models import Cluster

class Namespace(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        DELETING = 'deleting', 'Deleting'

    name = models.CharField(max_length=100)
    cluster = models.ForeignKey(Cluster, on_delete=models.CASCADE, related_name='namespaces')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['cluster', 'name'], name='unique_namespace_per_cluster')
        ]

    def __str__(self):
        return f"{self.name} (on {self.cluster.name})"