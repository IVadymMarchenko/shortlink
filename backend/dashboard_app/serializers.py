# dashboard_app/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class DashboardUserSerializer(serializers.ModelSerializer):
    
    plan_name = serializers.CharField(source='subscription.plan.name', default="No plan")
    max_projects = serializers.IntegerField(source='subscription.plan.max_projects', default=0)
    current_projects_count = serializers.IntegerField(default=0)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'plan_name', 'max_projects', 'current_projects_count']