#!/bin/bash
set -e

# 1. Применяем миграции базы данных
echo "Applying database migrations..."
python manage.py migrate --noinput

# 2. Собираем статику Django
echo "Collecting static files..."
python manage.py collectstatic --noinput

# 3. Запускаем Gunicorn на порту 8001 в фоновом режиме
echo "Starting Gunicorn server on 127.0.0.1:8001..."
gunicorn config.wsgi:application --bind 127.0.0.1:8001 --workers 2 --threads 2 &

# 4. Запускаем Nginx на порту 8000 (основной сервис Render)
echo "Starting Nginx server..."
nginx -g "daemon off;"
