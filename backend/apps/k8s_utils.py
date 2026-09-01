from kubernetes import client
import base64
import os
from kubernetes.stream import stream


def get_k8s_apps_client(cluster):
    """مثل get_k8s_client قبلی، ولی AppsV1Api چون Deployment جزو apps/v1 هست، نه core/v1"""
    configuration = client.Configuration()
    configuration.host = f"https://{cluster.address}"
    configuration.api_key = {"authorization": f"Bearer {cluster.token}"}
    configuration.verify_ssl = False
    api_client = client.ApiClient(configuration)
    return client.AppsV1Api(api_client)


def get_k8s_core_client(cluster):
    """برای خوندن Podها به CoreV1Api نیاز داریم (Pod جزو core/v1 هست)"""
    configuration = client.Configuration()
    configuration.host = f"https://{cluster.address}"
    configuration.api_key = {"authorization": f"Bearer {cluster.token}"}
    configuration.verify_ssl = False
    api_client = client.ApiClient(configuration)
    return client.CoreV1Api(api_client)


def create_k8s_deployment(cluster, namespace_name, app_name, image, replicas, cpu, memory):
    apps_v1 = get_k8s_apps_client(cluster)

    # این label به Podها می‌چسبه، تا بعداً بتونیم بر اساس همین Podهای این App رو پیدا کنیم
    labels = {"app": app_name}

    container = client.V1Container(
        name=app_name,
        image=image,
        resources=client.V1ResourceRequirements(
            requests={"cpu": cpu, "memory": memory},
            limits={"cpu": cpu, "memory": memory},
        ),
    )

    pod_template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels=labels),
        spec=client.V1PodSpec(containers=[container]),
    )

    deployment_spec = client.V1DeploymentSpec(
        replicas=replicas,
        selector=client.V1LabelSelector(match_labels=labels),
        template=pod_template,
    )

    deployment = client.V1Deployment(
        metadata=client.V1ObjectMeta(name=app_name, labels=labels),
        spec=deployment_spec,
    )

    return apps_v1.create_namespaced_deployment(
        namespace=namespace_name,
        body=deployment,
    )
def get_app_pods_status(cluster, namespace_name, app_name):
    core_v1 = get_k8s_core_client(cluster)
    pods = core_v1.list_namespaced_pod(
        namespace=namespace_name,
        label_selector=f"app={app_name}"
    )

    pod_statuses = []
    for pod in pods.items:
        ready = False
        if pod.status.conditions:
            for condition in pod.status.conditions:
                if condition.type == "Ready" and condition.status == "True":
                    ready = True
                    break

        pod_statuses.append({
            "name": pod.metadata.name,
            "ready": ready,
            "phase": pod.status.phase,  # مثل "Running", "Pending", "Failed"
        })

    return pod_statuses

def delete_k8s_deployment(cluster, namespace_name, app_name):
    apps_v1 = get_k8s_apps_client(cluster)
    return apps_v1.delete_namespaced_deployment(name=app_name, namespace=namespace_name)


def update_k8s_deployment(cluster, namespace_name, app_name, replicas, cpu, memory):
    apps_v1 = get_k8s_apps_client(cluster)

    # اول Deployment فعلی رو می‌خونیم تا فقط قسمت‌های لازم رو تغییر بدیم
    deployment = apps_v1.read_namespaced_deployment(name=app_name, namespace=namespace_name)

    deployment.spec.replicas = replicas
    deployment.spec.template.spec.containers[0].resources = client.V1ResourceRequirements(
        requests={"cpu": cpu, "memory": memory},
        limits={"cpu": cpu, "memory": memory},
    )

    return apps_v1.patch_namespaced_deployment(
        name=app_name,
        namespace=namespace_name,
        body=deployment,
    )




def exec_backup_in_pod(cluster, namespace_name, pod_name, source_path, local_output_path):
    core_v1 = get_k8s_core_client(cluster)

    inner_path = source_path.lstrip('/')
    # خروجی tar رو با base64 انکود می‌کنیم تا انتقالش کاملاً متنی و مطمئن باشه
    exec_command = ['sh', '-c', f'tar cf - -C / {inner_path} | base64']

    resp = stream(
        core_v1.connect_get_namespaced_pod_exec,
        pod_name,
        namespace_name,
        command=exec_command,
        stderr=True, stdin=False,
        stdout=True, tty=False,
        _preload_content=False,
    )

    output_chunks = []
    while resp.is_open():
        resp.update(timeout=1)
        if resp.peek_stdout():
            output_chunks.append(resp.read_stdout())
        if resp.peek_stderr():
            resp.read_stderr()  # فقط برای دیباگ؛ اگه خواستی می‌تونی این رو لاگ کنی

    resp.close()

    b64_data = ''.join(output_chunks)
    binary_data = base64.b64decode(b64_data)

    os.makedirs(os.path.dirname(local_output_path), exist_ok=True)
    with open(local_output_path, 'wb') as f:
        f.write(binary_data)

    return local_output_path

def get_one_pod_name(cluster, namespace_name, app_name):
    core_v1 = get_k8s_core_client(cluster)
    pods = core_v1.list_namespaced_pod(
        namespace=namespace_name,
        label_selector=f"app={app_name}"
    )
    if not pods.items:
        raise Exception(f"No pods found for app {app_name}")
    return pods.items[0].metadata.name