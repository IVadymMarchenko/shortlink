# dashboard_app/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardUserSerializer(serializers.ModelSerializer):
    plan_slug = serializers.SerializerMethodField()
    current_projects_count = serializers.IntegerField(default=0)
    is_custom_slug_allowed = serializers.SerializerMethodField()
    is_default_free = serializers.SerializerMethodField()
    
    # Отдаем оба перевода названия напрямую из БД
    plan_name_uk = serializers.SerializerMethodField()
    plan_name_en = serializers.SerializerMethodField()
    
    # ИСПРАВЛЕНО: переводим max_projects на SerializerMethodField, чтобы избежать ошибки ImproperlyConfigured
    max_projects = serializers.SerializerMethodField()
   
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'plan_slug', 
            'plan_name_uk', 'plan_name_en', 
            'max_projects', 'current_projects_count', 
            'is_custom_slug_allowed', 'is_default_free'
        ]

    def get_max_projects(self, obj):
        # Безопасно достаем лимит проектов из связанной модели тарифа
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.max_projects
        return 5  # Дефолтное значение для бесплатного тарифа без подписки

    def get_plan_slug(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.slug.lower()
        return 'free'

    def get_plan_name_uk(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.name_uk or obj.subscription.plan.slug
        return 'Безкоштовний'

    def get_plan_name_en(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.name_en or obj.subscription.plan.slug
        return 'Free'
    
    def get_is_custom_slug_allowed(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.is_custom_slug_allowed
        return False
    
    def get_is_default_free(self, obj):
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.is_default_free
        return True