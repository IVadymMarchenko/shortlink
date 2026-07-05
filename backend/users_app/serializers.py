from rest_framework import serializers
from .models import User,PricingPlan, UserSubscriptions
from django.db import transaction


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id','name','email', 'password']
        extra_kwargs = {
            # Пароль принимается от фронтенда, но НЕ возвращается в ответе API
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def create(self, validated_data):
        with transaction.atomic():
            password = validated_data.pop('password', None)
            instance = self.Meta.model(**validated_data)
            if password is not None:
                instance.set_password(password)
            instance.save()

            try:
                free_plan = PricingPlan.objects.get(slug='Free')
            except PricingPlan.DoesNotExist:
                free_plan = PricingPlan.objects.create(
                    slug='Free',
                    name='Free',
                    price=0.00,
                    max_projects=5
                )

            UserSubscriptions.objects.create(
                user=instance,
                plan=free_plan,
                is_active=True
            )
        return instance
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)