"""URL configuration for works app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkViewSet

router = DefaultRouter()
router.register(r'', WorkViewSet, basename='work')

urlpatterns = [
    path('', include(router.urls)),
]
