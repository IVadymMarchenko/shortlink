from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from users_app.models import PricingPlan,UserSubscriptions


class FakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_slug = request.data.get('plan_slug') # Получаем slug от фронтенда
        
        if not plan_slug:
            return Response({"error": "Plan slug is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            # Ищем план в базе данных по slug (без учета регистра)
            plan = PricingPlan.objects.get(slug__iexact=plan_slug, is_active=True)
        except PricingPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # Получаем или создаем запись подписки для текущего юзера
        subscription, created = UserSubscriptions.objects.get_or_create(
            user=request.user,
            defaults={'plan': plan} # если создаем впервые
        )
        
        # Обновляем план и продлеваем подписку на 30 дней
        subscription.plan = plan
        subscription.start_date = timezone.now()
        subscription.end_date = timezone.now() + timedelta(days=30)
        subscription.is_active = True
        subscription.save()

        return Response({
            "status": "success",
            "message": f"Successfully subscribed to {plan.name}",
            "plan_name": plan.name # возвращаем имя для фронта
        }, status=status.HTTP_200_OK)