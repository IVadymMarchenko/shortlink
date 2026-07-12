# dashboard_app/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardUserSerializer(serializers.ModelSerializer):
    # Наш строгий системный слаг для логики фронтенда и кнопок
    plan_slug = serializers.SerializerMethodField()
    
    # Исправляем plan_name: теперь он безопасно берет slug или украиноязычное имя по умолчанию
    plan_name = serializers.SerializerMethodField()
    
    max_projects = serializers.IntegerField(source='subscription.plan.max_projects', default=5)
    current_projects_count = serializers.IntegerField(default=0)

    class Meta:
        model = User
        # Добавили plan_slug в список полей
        fields = ['id', 'name', 'email', 'plan_slug', 'plan_name', 'max_projects', 'current_projects_count']

    def get_plan_slug(self, obj):
        # Благодаря select_related('subscription__plan') во View, этот запрос выполнится мгновенно без обращения к БД
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            return obj.subscription.plan.slug.lower()
        return 'free'

    def get_plan_name(self, obj):
        # Безопасно отдаем имя для отображения
        if hasattr(obj, 'subscription') and obj.subscription and obj.subscription.plan:
            plan = obj.subscription.plan
            return plan.name_uk or plan.slug
        return 'Безкоштовний'