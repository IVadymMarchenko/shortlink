from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from .serializers import UserSerializer,LoginSerializer
from django.conf import settings
from .services import create_jwt,set_auth_cookie,GoogleAuthService
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .authentication import JWTAuthentication
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PricingPlan
from .serializers import PricingPlanSerializer


class RegistrView(APIView):
    
    def post(self,request):
        serializer = UserSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
       
        response = Response(serializer.data)
        
        set_auth_cookie(response, user)

        return response
    


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(email=email, password=password)
        if user is None:
            raise AuthenticationFailed("errors.userNotFound")
            
        response = Response()
        token = set_auth_cookie(response, user)
        
        response.data = {
            "jwt": token,
        }
        
        return response
    


class UserView(APIView):

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)



class LogOut(APIView):
    def post(self,request):
        response = Response()
        response.delete_cookie('jwt')
        response.data = {
            "message": 'succes'
        }
        return response



class GoogleLoginAPIView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        if not access_token:
            return Response(
                {"error": "access_token is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        user = GoogleAuthService.authenticate_or_create_user(access_token)
        response = Response(
            {"success": True, "detail": "User authenticated successfully."},
            status=status.HTTP_200_OK
        )
        set_auth_cookie(response, user)
        
        return response
    





from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny  # Чтобы даже неавторизованные гости видели тарифы

from .models import PricingPlan
from .serializers import PricingPlanSerializer

class PricingPlanListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):
        # Берем только активные тарифы и сортируем их по цене (от дешевых к дорогим)
        plans = PricingPlan.objects.filter(is_active=True).order_by('price')
        
        # Передаем request в context, чтобы сериализатор смог прочитать заголовок языка!
        serializer = PricingPlanSerializer(plans, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

