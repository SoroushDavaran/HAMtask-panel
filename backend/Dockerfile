FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# این مقادیر فقط برای مرحله Build (collectstatic) هستن؛
# موقع اجرای واقعی Container، مقادیر واقعی از docker-compose.yml/.env جایگزینشون میشن
ENV SECRET_KEY=build-time-placeholder-not-real
ENV DB_NAME=placeholder
ENV DB_USER=placeholder
ENV DB_PASSWORD=placeholder
ENV DB_HOST=placeholder
ENV DB_PORT=5432
ENV REDIS_URL=redis://localhost:6379/0
ENV DEBUG=False

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "k8sbackend.wsgi:application", "--bind", "0.0.0.0:8000"]