"""URL configuration for screen app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScreenWorkViewSet, AdaptationEdgeViewSet

router = DefaultRouter()
router.register(r'works', ScreenWorkViewSet, basename='screenwork')
router.register(r'adaptations', AdaptationEdgeViewSet, basename='adaptation')

urlpatterns = [
    path('', include(router.urls)),
]
