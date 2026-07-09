# links_app/serializers.py
from rest_framework import serializers
from .models import ShortLink,LinkAnalytics

class ShortLinkCreateSerializer(serializers.ModelSerializer):
    short_url = serializers.SerializerMethodField()
    # allow_blank=True разрешает фронтенду слать пустую строку
    short_code = serializers.CharField(required=False, allow_blank=True, max_length=50)

    class Meta:
        model = ShortLink
        fields = ['id', 'original_url', 'short_code', 'short_url', 'created_at', 'clicks_count']

    def get_short_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(f"/{obj.short_code}/")
        return f"/{obj.short_code}/"

    def validate_short_code(self, value):
        # Если поле пустое (пробелы или пустая строка), возвращаем None, чтобы не ломать if в модели
        if not value or value.strip() == "":
            return None
            
        value = value.strip().lower()
        
        # Проверяем уникальность кастомного слага
        if ShortLink.objects.filter(short_code=value).exists():
            raise serializers.ValidationError("slug_already_taken")
            
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        
        # Проверяем подписку
        try:
            plan_name = user.subscription.plan.name.lower()
        except AttributeError:
            plan_name = 'free'

        is_pro = 'pro' in plan_name or 'popular' in plan_name
        short_code = validated_data.get('short_code')

        # Защита: если юзер FREE, принудительно стираем то, что он прислал в обход фронтенда
        if not is_pro or short_code is None:
            validated_data.pop('short_code', None) # Удаляем полностью, чтобы включился метод save() модели

        return ShortLink.objects.create(user=user, **validated_data)
    


class LinkAnalyticsDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = LinkAnalytics
        fields = ['id','clicked_at','country','device_type','os']



class LinkSummaryAnalyticsSerializer(serializers.ModelSerializer):

    analytics = LinkAnalyticsDetailSerializer(many = True,read_only=True)
    unique_clicks_count = serializers.SerializerMethodField()

    class Meta:
        model = ShortLink
        fields = ['id', 'original_url', 'short_code', 'clicks_count', 'unique_clicks_count','created_at', 'analytics']

    def get_unique_clicks_count(self, obj):
        return obj.analytics.values('ip_address').distinct().count()
    


class ShortLinkListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShortLink
        fields = ['id', 'original_url', 'short_code', 'clicks_count', 'created_at']