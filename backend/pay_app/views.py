from datetime import timedelta
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from users_app.models import PricingPlan, UserSubscriptions


class FakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_slug = request.data.get('plan_slug')
        
        if not plan_slug:
            return Response({"error": "Plan slug is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Шукаємо активний план по slug (без урахування регістру)
            plan = PricingPlan.objects.get(slug__iexact=plan_slug, is_active=True)
        except PricingPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # Безпечно отримуємо поточну передплату користувача або створюємо нову, якщо її немає
        subscription, created = UserSubscriptions.objects.get_or_create(
            user=request.user,
            defaults={
                'plan': plan,
                'is_active': True,
                'start_date': timezone.now(),
                'end_date': timezone.now() + timedelta(days=30)
            }
        )
        
       # Якщо передплата вже існувала, оновлюємо її параметри під новий тариф
        if not created:
            subscription.plan = plan
            subscription.start_date = timezone.now()
            subscription.end_date = timezone.now() + timedelta(days=30)
            subscription.is_active = True
            
        # Скидаємо лічильники лімітів у будь-якому випадку
        subscription.current_links_count = 0
        subscription.current_custom_slugs_count = 0
        subscription.save()

        # ВИЗНАЧУЄМО МОВУ: дістаємо локалізоване ім'я плану для фронтенду
        lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'uk')
        display_name = plan.name_en if 'en' in lang else plan.name_uk

        return Response({
            "status": "success",
            "message": f"Successfully subscribed to {display_name}",
            "plan_name": display_name,
            "plan_slug": plan.slug.lower()
        }, status=status.HTTP_200_OK)