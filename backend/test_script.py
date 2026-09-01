import requests
import time

BASE_URL = "http://127.0.0.1:8000/api"

# از تست‌های قبلی می‌دونیم namespace با این id رو داری (test-ns2)
NAMESPACE_ID = 1

# --- تغییر طلایی: ساخت یک اسم کاملاً یکتا برای هر بار اجرای تست ---
unique_app_name = f"test-app-{int(time.time())}"

print(f"=== قدم ۰: ساخت یک App واقعی ({unique_app_name}) ===")
resp = requests.post(f"{BASE_URL}/apps/", json={
    "name": unique_app_name,
    "namespace_id": NAMESPACE_ID,
    "image": "nginx:latest",
    "replicas": 1,
    "cpu": "250m",
    "memory": "256Mi",
})
print("Status Code:", resp.status_code)
print("Response:", resp.json())

if resp.status_code != 201:
    print("!! ساخت App شکست خورد.")
    exit()

app_id = resp.json()["id"]
print(f"\napp_id گرفته‌شده: {app_id}")

print("\n=== منتظر می‌مونیم Pod بالا بیاد (۱۵ ثانیه) ===")
time.sleep(15)

print("\n=== چک کردن وضعیت Pod قبل از Backup ===")
resp = requests.get(f"{BASE_URL}/apps/?namespace_id={NAMESPACE_ID}")
for app in resp.json():
    if app["id"] == app_id:
        print("پادها:", app.get("pods", []))

print("\n=== قدم ۱: ثبت درخواست Backup فوری ===")
resp = requests.post(f"{BASE_URL}/backup", json={
    "app_id": app_id,
    "source_path": "/etc/hostname"
})
print("Status Code:", resp.status_code)
print("Response:", resp.json())

if resp.status_code != 202:
    print("!! درخواست backup شکست خورد، ادامه نمیدیم.")
    exit()

backup_id = resp.json()["backup_id"]
print(f"\nbackup_id گرفته‌شده: {backup_id}")

print("\n=== قدم ۲: Poll کردن وضعیت تا تکمیل یا شکست (حداکثر ۶۰ ثانیه) ===")
final_status = None
data = {}
for i in range(20):
    resp = requests.get(f"{BASE_URL}/backup/{backup_id}")
    data = resp.json()
    status = data.get("status")
    print(f"[{i*3}s] وضعیت فعلی: {status}")

    if status in ("completed", "failed"):
        final_status = status
        print("\nپاسخ نهایی کامل:", data)
        break

    time.sleep(3)

if final_status is None:
    print("\n!! بعد از ۶۰ ثانیه هنوز pending/running مونده — احتمالاً Celery Worker روشن نیست.")
elif final_status == "failed":
    print(f"\n!! Backup شکست خورد. پیام خطا: {data.get('error_message')}")
else:
    print(f"\n✓ Backup با موفقیت کامل شد. مسیر خروجی: {data.get('output_path')}")

print("\n=== قدم ۳: گرفتن لیست همه Backupهای این App ===")
resp = requests.get(f"{BASE_URL}/backup", params={"app_id": app_id})
print("Status Code:", resp.status_code)
print("لیست Backupها:", resp.json())