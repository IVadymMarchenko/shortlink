from django.urls import path
from .views import FakePaymentView



urlpatterns = [
   path('fake-payment/', FakePaymentView.as_view(), name='pay'),
   
]
