import time
from contextlib import contextmanager

from prometheus_client import Counter, Histogram, Gauge

kubernetes_operations_total = Counter(
    "hamamooz_kubernetes_operations_total",
    "Total number of Kubernetes-related operations, by resource/operation/outcome",
    ["resource", "operation", "outcome"],
)

kubernetes_operation_duration_seconds = Histogram(
    "hamamooz_kubernetes_operation_duration_seconds",
    "Duration of Kubernetes-related operations in seconds",
    ["resource", "operation"],
)

backup_jobs_total = Counter(
    "hamamooz_backup_jobs_total",
    "Total number of backup jobs, by terminal outcome",
    ["outcome"],
)

backup_duration_seconds = Histogram(
    "hamamooz_backup_duration_seconds",
    "Duration of backup job execution in seconds",
)

backups_in_progress = Gauge(
    "hamamooz_backups_in_progress",
    "Number of backup jobs currently in progress",
)


@contextmanager
def track_operation(resource, operation):
    """دور یه بلوک کد می‌پیچه، duration رو اندازه می‌گیره و outcome رو
    success/error ثبت می‌کنه. اگه لازم بود outcome دستی error بشه
    (بدون exception، مثلا 404/409)، از طریق دیکشنری برگشتی ست کن:
        with track_operation("namespace", "delete") as op:
            op["outcome"] = "error"
    """
    start = time.monotonic()
    op = {"outcome": "success"}
    try:
        yield op
    except Exception:
        op["outcome"] = "error"
        raise
    finally:
        duration = time.monotonic() - start
        kubernetes_operation_duration_seconds.labels(
            resource=resource, operation=operation
        ).observe(duration)
        kubernetes_operations_total.labels(
            resource=resource, operation=operation, outcome=op["outcome"]
        ).inc()