from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, PricingPlan, UserSubscriptions


# 1. Стек-інлайн для підписки всередині картки користувача
class UserSubscriptionInline(admin.StackedInline):
    model = UserSubscriptions
    can_delete = False
    verbose_name_plural = 'Текущая подписка пользователя'
    fk_name = 'user'
    extra = 1


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

    inlines = [UserSubscriptionInline]

    # беремо slug або name_uk замість віддаленого name
    def get_plan(self, obj):
        sub = getattr(obj, 'subscription', None)
        if sub and sub.plan:
            return f"{sub.plan.name_uk} ({sub.plan.slug})"
        return "Нет подписки"
    
    get_plan.short_description = 'Текущий тариф'


# Виправлено: Стара форма PricingPlanAdminForm видалена, тому що поля 'name' більше немає.
# Натомість налаштовуємо зручне відображення полів тарифу в адмінці.
@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ('slug', 'name_uk', 'name_en', 'price', 'max_projects', 'is_default_free', 'is_active','is_featured')
    list_editable = ('is_active',)
    search_fields = ('slug', 'name_uk', 'name_en')
    
    fieldsets = (
        ('Основные настройки', {
            'fields': ('slug', 'price', 'max_projects', 'is_active','is_featured','is_default_free','is_custom_slug_allowed','max_custom_slug_allowed')
        }),
        ('Локализация имени и описания', {
            'fields': ('name_uk', 'name_en', 'description_uk', 'description_en')
        }),
        ('Доступные фичи (Зеленые галочки)', {
            'fields': ('features_uk', 'features_en'),
            'description': 'Заполняйте в формате JSON-массива: ["Фича 1", "Фича 2"]'
        }),
        ('Недоступные фичи (Красные крестики)', {
            'fields': ('features_disabled_uk', 'features_disabled_en'),
            'description': 'Заполняйте только для тарифа Free: ["Кастомные домены"]'
        }),
    )


# Реєстрація моделей, що залишилися
admin.site.register(User, UserAdmin)
admin.site.register(UserSubscriptions)