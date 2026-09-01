from django.db import models
from namespaces.models import Namespace


class App(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        DELETING = 'deleting', 'Deleting'

    name = models.CharField(max_length=100)
    namespace = models.ForeignKey(
        Namespace,
        on_delete=models.CASCADE,
        related_name='apps'
    )
    image = models.CharField(max_length=255)
    replicas = models.IntegerField(default=1)
    cpu = models.CharField(max_length=20, default='250m')
    memory = models.CharField(max_length=20, default='256Mi')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['namespace', 'name'],
                name='unique_app_per_namespace'
            )
        ]

    def __str__(self):
        return f"{self.name} (namespace: {self.namespace.name})"