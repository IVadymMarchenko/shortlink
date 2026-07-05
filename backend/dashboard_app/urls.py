# dashboard_app/urls.py
from django.urls import path
from .views import DashboardInfoView

urlpatterns = [
    path('info/', DashboardInfoView.as_view(), name='dashboard_info'),
]