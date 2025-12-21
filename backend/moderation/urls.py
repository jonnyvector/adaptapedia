"""URL configuration for moderation app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, DiffModerationViewSet, CommentModerationViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'diffs', DiffModerationViewSet, basename='diff-moderation')
router.register(r'comments', CommentModerationViewSet, basename='comment-moderation')

urlpatterns = [
    path('', include(router.urls)),
]
