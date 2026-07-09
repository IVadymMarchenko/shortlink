from django.urls import path
from .views import ShortLinkCreateView,LinkAnalyticsView,ShortLinkListView,ShortLinkDeleteView


urlpatterns = [
   path('create/', ShortLinkCreateView.as_view(), name='create_link'),
   path('<int:link_id>/analytics/', LinkAnalyticsView.as_view(), name='link_analytics'),
   path('links/', ShortLinkListView.as_view(), name='link-list'),
   path('<int:pk>/delete/',ShortLinkDeleteView.as_view(),name='delete_link')
]
