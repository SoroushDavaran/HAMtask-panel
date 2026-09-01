from django.db import transaction
from rest_framework import generics, status as http_status
from rest_framework.response import Response
from rest_framework.exceptions import APIException, ValidationError
from rest_framework import status
from kubernetes.client.exceptions import ApiException
from .models import Namespace
from .serializers import NamespaceSerializer
from .k8s_utils import create_k8s_namespace, delete_k8s_namespace


class ConflictException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'This namespace already exists in Kubernetes.'
    default_code = 'conflict'

class UnauthorizedException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication to Kubernetes failed. Check your cluster token.'
    default_code = 'unauthorized'

class BadGatewayException(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = 'Failed to communicate with the Kubernetes cluster.'
    default_code = 'bad_gateway'


class NamespaceListCreateView(generics.ListCreateAPIView):
    serializer_class = NamespaceSerializer

    def get_queryset(self):
        cluster_id = self.request.query_params.get('cluster_id')
        if not cluster_id:
            return Namespace.objects.none()
        return Namespace.objects.filter(cluster_id=cluster_id)

    def perform_create(self, serializer):
        cluster = serializer.validated_data['cluster']
        namespace_name = serializer.validated_data['name']
        try:
            create_k8s_namespace(cluster, namespace_name)
        except ApiException as e:
            if e.status == 409:
                raise ConflictException()
            elif e.status in [401, 403]:
                raise UnauthorizedException()
            else:
                raise BadGatewayException(detail=f"Kubernetes API error: {e.reason}")
        except Exception as e:
            raise BadGatewayException(detail=f"Connection failed: {str(e)}")
        serializer.save()


class NamespaceDeleteView(generics.DestroyAPIView):
    queryset = Namespace.objects.all()
    serializer_class = NamespaceSerializer

    def delete(self, request, *args, **kwargs):
        pk = kwargs['pk']

        with transaction.atomic():
            try:
                instance = Namespace.objects.select_for_update().get(pk=pk)
            except Namespace.DoesNotExist:
                return Response(status=http_status.HTTP_404_NOT_FOUND)

            if instance.status == Namespace.Status.DELETING:
                return Response(
                    {"detail": "Namespace is already being deleted by another request."},
                    status=http_status.HTTP_409_CONFLICT
                )

            instance.status = Namespace.Status.DELETING
            instance.save()

        try:
            delete_k8s_namespace(instance.cluster, instance.name)
        except ApiException as e:
            if e.status == 404:
                pass
            else:
                instance.status = Namespace.Status.ACTIVE
                instance.save()
                raise BadGatewayException(detail=f"Kubernetes API error: {e.reason}")
        except Exception as e:
            instance.status = Namespace.Status.ACTIVE
            instance.save()
            raise BadGatewayException(detail=f"Connection failed: {str(e)}")

        instance.delete()
        return Response(status=http_status.HTTP_204_NO_CONTENT)