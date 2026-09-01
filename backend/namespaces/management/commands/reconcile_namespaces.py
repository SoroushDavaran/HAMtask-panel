from django.core.management.base import BaseCommand
from namespaces.models import Namespace
from namespaces.k8s_utils import namespace_exists_in_k8s

class Command(BaseCommand):
    help = "Finds namespaces stuck in 'deleting' state (due to a crash) and cleans them up"

    def handle(self, *args, **options):
        stuck = Namespace.objects.filter(status=Namespace.Status.DELETING)
        for ns in stuck:
            exists = namespace_exists_in_k8s(ns.cluster, ns.name)
            if not exists:
                self.stdout.write(f"{ns.name}: confirmed deleted from k8s, removing db record")
                ns.delete()
            else:
                self.stdout.write(f"{ns.name}: still exists in k8s, resetting to active for retry")
                ns.status = Namespace.Status.ACTIVE
                ns.save()