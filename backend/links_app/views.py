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
from .models import ShortLink
from .services import AnalyticsLinkService,LinkCreationService
from datetime import timedelta
from rest_framework.generics import ListAPIView
from datetime import timedelta
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError



User = get_user_model()


class ShortLinkCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # 1. Проверяем базовый формат присланных данных (структуру JSON)
        serializer = ShortLinkCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True) # Сама вызовет ValidationError 400, если данные кривые
        try:
            # 2. Вызываем сервис для выполнения бизнес-логики и записи в БД
            new_link = LinkCreationService.create_short_link(
                user=request.user,
                original_url=serializer.validated_data['original_url'],
                short_code=serializer.validated_data.get('short_code') # Здесь безопасно будет None или очищенный слаг
            )
            
            # 3. Возвращаем созданный объект обратно на фронтенд
            response_serializer = ShortLinkCreateSerializer(new_link, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except (PermissionDenied, ValidationError) as e:
            return Response(
                e.detail if hasattr(e, 'detail') else {"detail": str(e)}, 
                status=e.status_code
            )
    


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
    


class ShortLinkDeleteView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self,request,pk):
        link = get_object_or_404(ShortLink,pk=pk, user_id = request.user.id)
        link.delete()

        return Response(status = status.HTTP_204_NO_CONTENT)
    

    

