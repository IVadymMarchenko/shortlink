# links_app/services.py
from .models import LinkAnalytics, ShortLink
from django.db import transaction
from rest_framework.exceptions import PermissionDenied, ValidationError
from users_app.models import UserSubscriptions

# links_app/services.py
class AnalyticsLinkService:

    @classmethod
    def track_link(cls, request, link: ShortLink):
        user_agent = request.user_agent
        os_name = user_agent.os.family or "Unknown"
        country_name = request.META.get('HTTP_CF_IPCOUNTRY', 'Local/Unknown')

        # ВЫЧИСЛЯЕМ IP-АДРЕС
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')

        if user_agent.is_mobile:
            device = "Mobile"
        elif user_agent.is_tablet:
            device = "Tablet"
        elif user_agent.is_pc:
            device = "PC"
        else:
            device = "Bot/Unknown"

        # Сохраняем аналитику вместе с IP
        LinkAnalytics.objects.create(
            link=link,
            ip_address=ip,
            country=country_name,
            device_type=device,
            os=os_name
        )

        link.increment_clicks()




class LinkCreationService:
    @staticmethod
    @transaction.atomic  # Гарантирует безопасность при параллельных запросах
    def create_short_link(user, original_url, short_code=None) -> ShortLink:
        """
        Создает короткую ссылку с проверкой лимитов по оптимизированным счетчикам.
        """
        # 1. Получаем подписку и БЛОКИРУЕМ её строку в базе (.select_for_update())
        # Это защищает от Race Condition (состояния гонки) на 100%
        try:
            subscription = (UserSubscriptions.objects
                            .select_for_update() 
                            .get(user=user))
        except UserSubscriptions.DoesNotExist:
            raise PermissionDenied("You do not have an active subscription.")

        # Проверяем и при необходимости сбрасываем счетчики (наш тест на 1 минуту сработает тут!)
        subscription.check_and_update_status()

        if not subscription.is_active:
            raise PermissionDenied("Your subscription is suspended. Contact support.")

        # 2. Мгновенная проверка лимита ссылок
        if subscription.current_links_count >= subscription.plan.max_projects:
            raise PermissionDenied(
                f"You have reached the limit of your plan ({subscription.plan.max_projects} links)."
            )

        is_custom = bool(short_code and short_code.strip())

        # 3. Проверяем лимиты на кастомные слаги
        if is_custom:
            # Разрешены ли они вообще на тарифе?
            if not subscription.plan.is_custom_slug_allowed:
                raise ValidationError({"short_code": "custom_slug_not_allowed_for_current_plan"})

            # Не превышен ли количественный лимит за период?
            if subscription.current_custom_slugs_count >= subscription.plan.max_custom_slug_allowed:
                raise ValidationError({"short_code": "custom_slug_limit_exceeded"})

        # 4. Создаем саму ссылку в базе данных
        link = ShortLink.objects.create(
            user=user,
            original_url=original_url,
            short_code=short_code or "",
            is_custom=is_custom
        )

        # 5. Инкрементируем счетчики подписки
        subscription.current_links_count += 1
        if is_custom:
            subscription.current_custom_slugs_count += 1
        
        # Сохраняем только измененные поля счетчиков
        subscription.save(update_fields=['current_links_count', 'current_custom_slugs_count'])

        return link