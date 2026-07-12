import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import DashboardUserSerializer
from users_app.authentication import JWTAuthentication


logger = logging.getLogger(__name__)
User = get_user_model()

class DashboardInfoView(APIView):
    # Явно указываем Джанго использовать твой JWT из кук, минуя стандартную CSRF-защиту сессий
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = User.objects.select_related('subscription__plan').get(id=request.user.id)

            
            if hasattr(user, 'subscription') and user.subscription:
                user.subscription.check_and_update_status()
           

            logger.info(f"User {user.email} accessed dashboard info.")
            serializer = DashboardUserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error loading dashboard for user {request.user.pk}: {e}", exc_info=True)
            return Response(
                {"detail": "An error occurred while loading the dashboard data."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )