"""URL configuration for diffs app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiffItemViewSet, DiffCommentViewSet, ComparisonVoteViewSet

router = DefaultRouter()
router.register(r'items', DiffItemViewSet, basename='diffitem')
router.register(r'comments', DiffCommentViewSet, basename='diffcomment')
router.register(r'comparison-votes', ComparisonVoteViewSet, basename='comparison-vote')

urlpatterns = [
    path('', include(router.urls)),
]
