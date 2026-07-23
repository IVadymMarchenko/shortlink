# links_app/models.py
import secrets
import string
from django.db import models
from django.db.models import F
from django.conf import settings

class ShortLink(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='links')
    original_url = models.URLField(max_length=500)
    short_code = models.CharField(max_length=50, unique=True, blank=True,db_index=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    clicks_count = models.PositiveIntegerField(default=0)
   
    is_custom = models.BooleanField(default=False, verbose_name="Is custom slug")


    def increment_clicks(self): 
        ShortLink.objects.filter(id=self.id).update(clicks_count=F('clicks_count') + 1)
        self.refresh_from_db(fields=['clicks_count'])


    def save(self, *args, **kwargs):
        if not self.short_code or str(self.short_code).strip() == "":
            characters = string.ascii_letters + string.digits
            while True:
                code = ''.join(secrets.choice(characters) for _ in range(6))
                if not ShortLink.objects.filter(short_code=code).exists():
                    self.short_code = code
                    break 
                
        super().save(*args, **kwargs)


class LinkAnalytics(models.Model):
    link = models.ForeignKey(ShortLink,on_delete=models.CASCADE,related_name='analytics')
    ip_address = models.GenericIPAddressField(default='127.0.0.1')
    clicked_at = models.DateTimeField(auto_now_add=True)
    country = models.CharField(max_length=255,default='unknown',verbose_name="country")
    device_type = models.CharField(max_length=255,default='unknown',verbose_name="device_type")
    os = models.CharField(max_length=255,default='unknown',verbose_name='operating system')
    