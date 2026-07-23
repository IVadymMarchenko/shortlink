# 1. Сборка React фронтенда
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./

# Принимаем аргумент из процесса сборки Render
ARG VITE_GOOGLE_CLIENT_ID
# Превращаем его в переменную окружения для Vite
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# 2. Основной контейнер (Python + Nginx)
FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем и устанавливаем зависимости Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# Копируем код бэкенда
COPY backend/ ./

# Копируем собранный React билд в папку Nginx
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Копируем конфиг Nginx и скрипт запуска
COPY render.nginx.conf /etc/nginx/sites-available/default
COPY render.nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
