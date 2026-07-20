import os
from celery import Celery

# Устанавливаем дефолтный модуль настроек Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Читаем настройки из settings.py, все конфиги Celery должны иметь префикс CELERY_
app.config_from_object('django.conf:settings', namespace='CELERY')

# Автоматически ищем файлы tasks.py во всех установленных приложениях (links_app, users_app и т.д.)
app.autodiscover_tasks()