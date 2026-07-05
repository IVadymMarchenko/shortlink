# links_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .serializers import ShortLinkCreateSerializer,LinkSummaryAnalyticsSerializer,ShortLinkListSerializer
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.db.models import F
from .models import ShortLink, LinkAnalytics
from .services import AnalyticsLinkService
from datetime import timedelta
from rest_framework.generics import ListAPIView


User = get_user_model()

class ShortLinkCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            subscription = request.user.subscription
            
            #Сначала актуализируем тариф (сбрасываем на Free или обновляем месяц)
            subscription.check_and_update_status()
            #Вместо is_valid() просто смотрим на флаг активности (на случай бана админом)
            if not subscription.is_active:
                return Response(
                    {"detail": "Your subscription is suspended. Contact support."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
                
            max_limit = subscription.plan.max_projects 
        except AttributeError:
            return Response(
                {"detail": "You do not have an active subscription."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Считаем ссылки
        user_with_stats = (User.objects
                           .annotate(current_links_count=Count(
                               'links', 
                               filter=Q(links__created_at__gte=subscription.start_date)
                           ))
                           .get(id=request.user.id))
        
        # 4. Проверяем лимиты
        if user_with_stats.current_links_count >= max_limit:
            next_update = subscription.start_date + timedelta(days=30)
            return Response(
                {
                    "detail": f"You have reached the limit of your plan ({max_limit} links). "
                              f"Limits will reset on: {next_update.strftime('%d.%m.%Y')}."
                }, 
                status=status.HTTP_403_FORBIDDEN
            )
            
        # 5. Создание
        serializer = ShortLinkCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class LinkRedirectView(View):
    def get(self, request, short_code):

        link = get_object_or_404(ShortLink, short_code=short_code)
        AnalyticsLinkService.track_link(request, link)
        
        return redirect(link.original_url)
    


class LinkAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self,request,link_id):

        link = get_object_or_404(ShortLink,id = link_id, user = request.user)
        serializer = LinkSummaryAnalyticsSerializer(link)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ShortLinkListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ShortLinkListSerializer

    def get_queryset(self):
        return ShortLink.objects.filter(user = self.request.user).order_by('-created_at')
    

    

