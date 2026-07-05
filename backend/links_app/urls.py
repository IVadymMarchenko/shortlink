from django.urls import path
from .views import ShortLinkCreateView,LinkAnalyticsView,ShortLinkListView


urlpatterns = [
   path('create/', ShortLinkCreateView.as_view(), name='create_link'),
   path('<int:link_id>/analytics/', LinkAnalyticsView.as_view(), name='link_analytics'),
   path('links/', ShortLinkListView.as_view(), name='link-list'),
]
