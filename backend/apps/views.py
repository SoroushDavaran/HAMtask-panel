from django.db import transaction
from rest_framework import generics, status as http_status
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status
from kubernetes.client.exceptions import ApiException

from .models import App
from .serializers import AppSerializer
from .k8s_utils import create_k8s_deployment, delete_k8s_deployment, update_k8s_deployment


class ConflictException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'This app already exists in Kubernetes.'
    default_code = 'conflict'

class UnauthorizedException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication to Kubernetes failed. Check your cluster token.'
    default_code = 'unauthorized'

class BadGatewayException(APIException):
    status_code = status.HTTP_502_BAD_GATEWAY
    default_detail = 'Failed to communicate with the Kubernetes cluster.'
    default_code = 'bad_gateway'


class AppListCreateView(generics.ListCreateAPIView):
    serializer_class = AppSerializer

    def get_queryset(self):
        namespace_id = self.request.query_params.get('namespace_id')
        if not namespace_id:
            return App.objects.none()
        return App.objects.filter(namespace_id=namespace_id)

    def perform_create(self, serializer):
        namespace = serializer.validated_data['namespace']
        name = serializer.validated_data['name']
        image = serializer.validated_data['image']
        replicas = serializer.validated_data.get('replicas', 1)
        cpu = serializer.validated_data.get('cpu', '250m')
        memory = serializer.validated_data.get('memory', '256Mi')

        try:
            create_k8s_deployment(
                namespace.cluster, namespace.name, name, image, replicas, cpu, memory
            )
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


class AppUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    queryset = App.objects.all()
    serializer_class = AppSerializer

    def perform_update(self, serializer):
        instance = self.get_object()
        namespace = instance.namespace

        replicas = serializer.validated_data.get('replicas', instance.replicas)
        cpu = serializer.validated_data.get('cpu', instance.cpu)
        memory = serializer.validated_data.get('memory', instance.memory)

        try:
            update_k8s_deployment(
                namespace.cluster, namespace.name, instance.name, replicas, cpu, memory
            )
        except ApiException as e:
            if e.status == 404:
                raise BadGatewayException(detail="Deployment not found in Kubernetes.")
            elif e.status in [401, 403]:
                raise UnauthorizedException()
            else:
                raise BadGatewayException(detail=f"Kubernetes API error: {e.reason}")
        except Exception as e:
            raise BadGatewayException(detail=f"Connection failed: {str(e)}")

        serializer.save()

    def delete(self, request, *args, **kwargs):
        pk = kwargs['pk']

        with transaction.atomic():
            try:
                instance = App.objects.select_for_update().get(pk=pk)
            except App.DoesNotExist:
                return Response(status=http_status.HTTP_404_NOT_FOUND)

            if instance.status == App.Status.DELETING:
                return Response(
                    {"detail": "App is already being deleted by another request."},
                    status=http_status.HTTP_409_CONFLICT
                )

            instance.status = App.Status.DELETING
            instance.save()

        namespace = instance.namespace
        try:
            delete_k8s_deployment(namespace.cluster, namespace.name, instance.name)
        except ApiException as e:
            if e.status == 404:
                pass  # از قبل تو Kubernetes نبوده - مشکلی نیست
            else:
                instance.status = App.Status.ACTIVE
                instance.save()
                raise BadGatewayException(detail=f"Kubernetes API error: {e.reason}")
        except Exception as e:
            instance.status = App.Status.ACTIVE
            instance.save()
            raise BadGatewayException(detail=f"Connection failed: {str(e)}")

        instance.delete()
        return Response(status=http_status.HTTP_204_NO_CONTENT)