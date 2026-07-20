from celery import shared_task
from django.shortcuts import get_object_or_404
from .models import ShortLink, LinkAnalytics

@shared_task
def track_link_analytics_task(link_id, analytics_data):
    """
    Фоновая задача для записи аналитики клика и обновления счетчика.
    """
    # 1. Находим ссылку, по которой кликнули
    try:
        link = ShortLink.objects.get(id=link_id)
    except ShortLink.DoesNotExist:
        # Если ссылку внезапно удалили, пока задача шла до Redis — просто выходим
        return f"Режим разработчика: Ссылка {link_id} не найдена."

    # 2. Создаем запись аналитики из готовых данных
    LinkAnalytics.objects.create(
        link=link,
        ip_address=analytics_data['ip_address'],
        country=analytics_data['country'],
        device_type=analytics_data['device_type'],
        os=analytics_data['os']
    )

    # 3. Инкрементируем счетчик кликов
    link.increment_clicks()
    
    return f"Режим разработчика: Аналитика для ссылки {link_id} успешно сохранена."