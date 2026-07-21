from rest_framework import serializers
from .models import User,PricingPlan, UserSubscriptions
from django.db import transaction



class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id','name','email', 'password']
        extra_kwargs = {
            'password': {
                'write_only': True, 
                'style': {'input_type': 'password'},
                'error_messages': {
                    'blank': 'errors.requiredField',
                    'min_length': 'errors.passwordTooShort'
                }
            },
            #переопределение текста ошибок для фронт ошибок 
            'email': {
                'error_messages': {
                    'unique': 'errors.emailAlreadyExists',
                    'blank': 'errors.requiredField',
                    'invalid': 'errors.invalidEmail'
                }
            },
            'name': {
                'error_messages': {
                    'blank': 'errors.requiredField'
                }
            }
        }

    def create(self, validated_data):
        with transaction.atomic():
            password = validated_data.pop('password', None)
            instance = self.Meta.model(**validated_data)
            if password is not None:
                instance.set_password(password)
            instance.save()

            # Шукаємо дефолтний активний тариф прапором
            free_plan = PricingPlan.objects.filter(is_default_free=True, is_active=True).first()
            
            if not free_plan:
                raise serializers.ValidationError(
                    {"detail": "Registration error: Default pricing plan is not configured."}
                )
            
            # Створюємо передплату для нового користувача
            UserSubscriptions.objects.create(
                user=instance,
                plan=free_plan,
                is_active=True
            )
        return instance
    

class LoginSerializer(serializers.Serializer):
    # Для серіалізаторів без Meta перехоплювачі пишуться прямо всередині поля:
    email = serializers.EmailField(error_messages={
        'blank': 'errors.requiredField',
        'invalid': 'errors.invalidEmail'
    })
    password = serializers.CharField(write_only=True, error_messages={
        'blank': 'errors.requiredField'
    })




class PricingPlanSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    features_disabled = serializers.SerializerMethodField()

    class Meta:
        model = PricingPlan
        # Виправлено: Додали поля лімітів кастомних складів у видачу API
        fields = [
            'id', 'slug', 'price', 'max_projects', 
            'is_custom_slug_allowed', 'max_custom_slug_allowed', 
            'name', 'description', 'features', 'features_disabled', 'is_featured'
        ]

    def _get_current_lang(self):
        request = self.context.get('request')
        if request:
            lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'uk')
            return 'en' if 'en' in lang else 'uk'
        return 'uk'

    def get_name(self, obj):
        return obj.name_en if self._get_current_lang() == 'en' else obj.name_uk

    def get_description(self, obj):
        return obj.description_en if self._get_current_lang() == 'en' else obj.description_uk

    def get_features(self, obj):
        return obj.features_en if self._get_current_lang() == 'en' else obj.features_uk

    def get_features_disabled(self, obj):
        return obj.features_disabled_en if self._get_current_lang() == 'en' else obj.features_disabled_uk