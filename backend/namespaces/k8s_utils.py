from kubernetes import client

def get_k8s_client(cluster):
    configuration = client.Configuration()
    configuration.host = f"https://{cluster.address}"
    configuration.api_key = {"authorization": f"Bearer {cluster.token}"}
    configuration.verify_ssl = False
    api_client = client.ApiClient(configuration)
    return client.CoreV1Api(api_client)

def create_k8s_namespace(cluster, namespace_name):
    v1 = get_k8s_client(cluster)
    metadata = client.V1ObjectMeta(name=namespace_name)
    namespace_body = client.V1Namespace(metadata=metadata)
    return v1.create_namespace(body=namespace_body)

def delete_k8s_namespace(cluster, namespace_name):
    v1 = get_k8s_client(cluster)
    return v1.delete_namespace(name=namespace_name)

def namespace_exists_in_k8s(cluster, namespace_name):
    v1 = get_k8s_client(cluster)
    try:
        v1.read_namespace(name=namespace_name)
        return True
    except client.exceptions.ApiException as e:
        if e.status == 404:
            return False
        raise