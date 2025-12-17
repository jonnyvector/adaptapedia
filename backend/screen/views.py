"""Views for screen app."""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ScreenWork, AdaptationEdge
from .serializers import ScreenWorkSerializer, AdaptationEdgeSerializer


class ScreenWorkViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ScreenWork model (read-only for now)."""

    queryset = ScreenWork.objects.all()
    serializer_class = ScreenWorkSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['title', 'summary']
    ordering_fields = ['title', 'year', 'created_at']
    ordering = ['-created_at']


class AdaptationEdgeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AdaptationEdge model (read-only for now)."""

    queryset = AdaptationEdge.objects.select_related('work', 'screen_work').all()
    serializer_class = AdaptationEdgeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['work', 'screen_work', 'relation_type']
