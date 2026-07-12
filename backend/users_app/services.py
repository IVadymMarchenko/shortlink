import jwt
from django.conf import settings
from django.utils import timezone
import datetime
import logging
import requests
from rest_framework.exceptions import AuthenticationFailed
from .models import User
from django.db import transaction
from .models import User, PricingPlan, UserSubscriptions
logger = logging.getLogger(__name__)


def create_jwt(user):
    now = timezone.now()

    payload = {
        "id": user.id,
        "exp": now + datetime.timedelta(minutes=60),
        "iat": now,
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")




class GoogleAuthService:
    GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

    @classmethod
    def get_google_user_data(cls, access_token: str) -> dict:
        try:
            response = requests.get(
                cls.GOOGLE_USERINFO_URL,
                params={'access_token': access_token},
                timeout=5 
            )
        except requests.exceptions.Timeout:
            logger.error("Google OAuth API timeout.")
            raise AuthenticationFailed("Google service timeout. Try again later.")
        except requests.exceptions.RequestException as e:
            logger.error(f"Google OAuth connection error: {e}")
            raise AuthenticationFailed("Failed to connect to Google identity provider.")
        
        if response.status_code != 200:
            logger.warning(f"Invalid Google token provided. Status code: {response.status_code}")
            raise AuthenticationFailed("Invalid or expired Google token.")
        return response.json()

    @classmethod
    def authenticate_or_create_user(cls, access_token: str) -> User:
        """Основной метод бизнес-логики: валидирует токен и возвращает юзера."""
        user_data = cls.get_google_user_data(access_token)
        email = user_data.get('email')

        if not email:
            raise AuthenticationFailed("Email verification failed: Google did not provide an email.")

        with transaction.atomic():
            # Находим или создаем пользователя
            user, created = User.objects.get_or_create(
                email=email,
                defaults={'is_active': True}
            )
            
            # Если пользователь зашел через Google впервые — привязываем ему тариф из админки
            if created:
                logger.info(f"Created new user via Google OAuth: {email}")
                
                try:
                    # Берем готовый тариф 'free' из базы
                    free_plan = PricingPlan.objects.get(slug='free')
                except PricingPlan.DoesNotExist:
                    logger.error("CRITICAL: Tried to register user via Google, but 'free' plan does not exist in DB.")
                    raise AuthenticationFailed("Registration error: Default pricing plan is not configured. Please contact support.")

                # Создаем подписку
                UserSubscriptions.objects.create(
                    user=user,
                    plan=free_plan,
                    is_active=True
                )
        return user





def set_auth_cookie(response, user):
    """
    Генерирует JWT-токен и устанавливает его в HttpOnly-куку для переданного ответа.
    """
    token = create_jwt(user)
    
    response.set_cookie(
        key="jwt",
        value=token,
        httponly=True,
        samesite='Lax',
        secure=False,  # Перед деплоем поменяешь на True
        max_age=60 * 600,  # 1 час
    )
    return token