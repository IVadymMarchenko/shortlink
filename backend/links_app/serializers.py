# links_app/serializers.py
from rest_framework import serializers
from .models import ShortLink,LinkAnalytics


class ShortLinkCreateSerializer(serializers.ModelSerializer):
    short_url = serializers.SerializerMethodField()
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
        """
        Чистимо та валідуємо конкретне поле short_code.
        """
        if not value or value.strip() == "":
            return None
        value = value.strip().lower()
        # Перевіряємо унікальність
        if ShortLink.objects.filter(short_code=value).exists():
            raise serializers.ValidationError("slug_already_taken")
        return value

    def validate(self, attrs):
        """
        Фінальна перехресна перевірка лімітів та прав.
        """
        user = self.context['request'].user
        short_code = attrs.get('short_code')

        # Якщо користувач намагається створити кастомний склад
        if short_code:
            # Безпечно отримуємо тарифний план користувача
            try:
                plan = user.subscription.plan
                # Просто беремо значення прапора із БД!
                is_allowed = plan.is_custom_slug_allowed
            except AttributeError:
                is_allowed = False

            if not is_allowed:
                raise serializers.ValidationError({
                    "short_code": "custom_slug_not_allowed_for_current_plan"
                })

        return attrs
    


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