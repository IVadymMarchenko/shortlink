import os
import django

# Инициализируем окружение Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Забираем данные из панели Render (или ставим безопасные дефолты)
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "SuperSecurePassword123")
name = os.environ.get("DJANGO_SUPERUSER_NAME", "Administrator")

# Проверяем существование по email
if not User.objects.filter(email=email).exists():

    User.objects.create_superuser(
        email=email, 
        password=password, 
        name=name
    )

else:
    print(f"Superuser with email {email} already exists.")