
from django.urls import path
from .views import RegistrView,LoginView,UserView,LogOut,GoogleLoginAPIView

urlpatterns = [
    path('register/',RegistrView.as_view()),
    path('login/',LoginView.as_view()),
    path('user/',UserView.as_view()),
    path('logout/',LogOut.as_view()),

    #для Google
    path('auth/google/', GoogleLoginAPIView.as_view(), name='google_json_login'),
]
