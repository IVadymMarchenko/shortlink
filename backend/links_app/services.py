# links_app/services.py
from .models import LinkAnalytics, ShortLink


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