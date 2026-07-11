from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.conf import settings
from datetime import timedelta



class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field must be filled in.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password) # Хешируем пароль
        user.save(using=self._db)
        return user


    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)



class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255,unique=True)
    password = models.CharField(max_length=255)
    username = None
   

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    
    objects = UserManager()



class PricingPlan(models.Model):
    "Plan's model"
    slug = models.SlugField(max_length=25,unique=True,verbose_name="identifier")
    price = models.DecimalField(max_digits=20,decimal_places=2,verbose_name="price")
    max_projects = models.IntegerField(default=5,verbose_name="maximum_links")
    is_active = models.BooleanField(default=True,verbose_name="status")

    # Мультиязычные названия
    name_uk = models.CharField(max_length=100, default='', verbose_name="Plan's name (UK)")
    name_en = models.CharField(max_length=100, default='', verbose_name="Plan's name (EN)")

    # Мультиязычные описания
    description_uk = models.TextField(blank=True, verbose_name="description (UK)")
    description_en = models.TextField(blank=True, verbose_name="description (EN)")

    # Списки ДОСТУПНЫХ фич (Зеленые галочки)
    features_uk = models.JSONField(default=list, verbose_name="Enabled features (UK)")
    features_en = models.JSONField(default=list, verbose_name="Enabled features (EN)")

    # Списки НЕДОСТУПНЫХ фич (Красные крестики — нужны только для Free тарифа)
    features_disabled_uk = models.JSONField(default=list, blank=True, verbose_name="Disabled features (UK)")
    features_disabled_en = models.JSONField(default=list, blank=True, verbose_name="Disabled features (EN)")

    def __str__(self):
        # ИСПРАВЛЕНО: используем slug или name_uk, так как поля name больше нет
        return f"{self.name_uk or self.slug} ({self.price} USD)"
    

class UserSubscriptions(models.Model):
    "Model subscription user"
    user = models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='subscription')
    plan = models.ForeignKey(PricingPlan,on_delete=models.PROTECT,verbose_name="Plan")
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="End date")
    is_active = models.BooleanField(default=True)
    

    def check_and_update_status(self):
        now = timezone.now()

        if self.plan.slug!='Free':
            if self.end_date and now > self.end_date:
                free_plan,created = PricingPlan.objects.get_or_create(
                    slug = "Free",
                    defaults={
                        'name': "Free",
                        'price':0.00,
                        'max_projects': 5,
                        'is_active': True
                    }
                )
                # Откатываем юзера на бесплатный тариф
                self.plan = free_plan
                self.end_date = None      
                self.start_date = now     # Сбрасываем дату отсчета лимитов на сегодня
                self.is_active = True
                self.save()
                return
            
        # 2. ЕСЛИ ТАРИФ БЕСПЛАТНЫЙ: проверяем, прошло ли 30 дней для обновления лимитов
        if self.plan.slug == 'free':
            if now >= self.start_date + timedelta(days=30):
                # Обновляем start_date. Это станет новой точкой отсчета для лимитов
                self.start_date = now
                self.save()
    
    def __str__(self):
        # ИСПРАВЛЕНО: name_uk вместо name
        return f"{self.user.name}, {self.user.email} - {self.plan.name_uk or self.plan.slug}"


