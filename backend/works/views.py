"""Views for works app."""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Work
from .serializers import WorkSerializer


class WorkViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Work model (read-only for now)."""

    queryset = Work.objects.all()
    serializer_class = WorkSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary']
    ordering_fields = ['title', 'year', 'created_at']
    ordering = ['-created_at']
