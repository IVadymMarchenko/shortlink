import os
import django
from django.contrib.auth import get_user_model



# Инициализируем настройки Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()


User = get_user_model()

# Забираем данные из окружения или ставим дефолтные
username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "SuperSecurePassword123")

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
