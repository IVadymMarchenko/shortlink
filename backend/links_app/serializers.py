# links_app/serializers.py
from rest_framework import serializers
from .models import ShortLink,LinkAnalytics

class ShortLinkCreateSerializer(serializers.ModelSerializer):
    # Создаем виртуальное поле для полной ссылки
    short_url = serializers.SerializerMethodField()

    class Meta:
        model = ShortLink
        # Добавляем short_url в список возвращаемых полей
        fields = ['id', 'original_url', 'short_code', 'short_url', 'created_at', 'clicks_count']


    def get_short_url(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(f"/{obj.short_code}/")
        return f"/{obj.short_code}/"

    def create(self, validated_data):
        user = self.context['request'].user
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