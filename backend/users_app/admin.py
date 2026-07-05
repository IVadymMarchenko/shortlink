# users_app/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django import forms
from .models import User, PricingPlan, UserSubscriptions

# 1. Создаем Inline для подписки
class UserSubscriptionInline(admin.StackedInline):
    model = UserSubscriptions
    can_delete = False  # Чтобы случайно не удалить подписку целиком
    verbose_name_plural = 'Текущая подписка пользователя'
    fk_name = 'user'
    extra = 1  # Если подписки нет, покажет пустую форму для создания

class UserAdminForm(forms.ModelForm):
    class Meta:
        model = User
        fields = '__all__'

class UserAdmin(BaseUserAdmin):
    form = UserAdminForm
    add_form = UserAdminForm

    list_display = ('email', 'name', 'get_plan', 'is_active', 'is_staff')
    ordering = ('email',)
    search_fields = ('email', 'name')
    list_filter = ('is_staff', 'is_active')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Личные данные', {'fields': ('name',)}),
        ('Права доступа', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'name', 'is_active', 'is_staff'),
        }),
    )

    # 2. ПОДКЛЮЧАЕМ INLINE СЮДА
    inlines = [UserSubscriptionInline]

    def get_plan(self, obj):
        sub = getattr(obj, 'subscription', None)
        return sub.plan.name if sub else "Нет подписки"
    
    get_plan.short_description = 'Текущий тариф'


class PricingPlanAdminForm(forms.ModelForm):
    class Meta:
        model = PricingPlan
        fields = '__all__'
        widgets = {
            # Вот здесь мы заставляем админку показать Select-выпадающий список
            'name': forms.Select(choices=[
                ('Free', 'Свободный (Free)'),
                ('Popular', 'Популярный (Popular)'),
                ('Pro', 'Профессиональный (Pro)'),
            ])
        }

# Регистрация моделей
admin.site.register(User, UserAdmin)
admin.site.register(UserSubscriptions)

@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    form = PricingPlanAdminForm  # Подключаем нашу форму к админке
