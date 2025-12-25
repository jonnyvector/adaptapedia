"""Views for screen app."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Max
from django_filters.rest_framework import DjangoFilterBackend
from .models import ScreenWork, AdaptationEdge
from .serializers import ScreenWorkSerializer, AdaptationEdgeSerializer
from works.serializers import WorkWithAdaptationsSerializer


class ScreenWorkViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ScreenWork model (read-only for now)."""

    queryset = ScreenWork.objects.all()
    serializer_class = ScreenWorkSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'year']
    search_fields = ['title', 'summary']
    ordering_fields = ['title', 'year', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='genres')
    def genres(self, request):
        """
        List all screen genres with comparison counts.

        Returns genres sorted by comparison count (most popular first).
        Each genre includes:
        - genre name
        - comparison_count: number of book→screen comparisons
        - diff_count: total diffs documented
        - last_updated: most recent diff update

        Query params:
        - type: filter by MOVIE or TV (optional)
        """
        from diffs.models import DiffItem

        # Optional type filter
        screen_type = request.query_params.get('type')
        screen_works_qs = ScreenWork.objects.exclude(primary_genre='')

        if screen_type and screen_type in ['MOVIE', 'TV']:
            screen_works_qs = screen_works_qs.filter(type=screen_type)

        # Get genres with counts
        genres = screen_works_qs.values('primary_genre').annotate(
            comparison_count=Count('source_works', distinct=True),
            diff_count=Count('diffs', filter=Q(diffs__status='LIVE'), distinct=True),
            last_updated=Max('diffs__updated_at', filter=Q(diffs__status='LIVE'))
        ).filter(
            comparison_count__gt=0  # Only genres with at least one comparison
        ).order_by('-comparison_count', '-diff_count', 'primary_genre')

        return Response({
            'results': list(genres)
        })

    @action(detail=False, methods=['get'], url_path='by-genre/(?P<genre>[^/.]+)')
    def by_genre(self, request, genre=None):
        """
        Get comparisons by genre.

        Returns book works with their screen adaptations for a specific genre.

        Query params:
        - type: filter by MOVIE or TV (optional)
        - page: page number
        - page_size: results per page (default 20)
        """
        from works.models import Work
        from works.services import SearchService
        from works.views import WorkPagination

        if not genre:
            return Response(
                {'error': 'Genre parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Optional type filter
        screen_type = request.query_params.get('type')

        # Find all screen works in this genre
        screen_works_qs = ScreenWork.objects.filter(primary_genre__iexact=genre)

        if screen_type and screen_type in ['MOVIE', 'TV']:
            screen_works_qs = screen_works_qs.filter(type=screen_type)

        # Get all works that have adaptations in this genre
        work_ids = AdaptationEdge.objects.filter(
            screen_work__in=screen_works_qs
        ).values_list('work_id', flat=True).distinct()

        works = Work.objects.filter(id__in=work_ids).order_by('-created_at')

        # Paginate
        paginator = WorkPagination()
        page = paginator.paginate_queryset(works, request)

        # Attach ranked adaptations (filtered by genre) to each work
        for work in page:
            # Get all adaptations for this work
            all_adaptations = SearchService.get_ranked_adaptations_for_work(work)
            # Filter to only this genre
            work.ranked_adaptations = [
                adaptation for adaptation in all_adaptations
                if adaptation.primary_genre and adaptation.primary_genre.lower() == genre.lower()
            ]

        return paginator.get_paginated_response(
            WorkWithAdaptationsSerializer(page, many=True).data
        )


class AdaptationEdgeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AdaptationEdge model (read-only for now)."""

    queryset = AdaptationEdge.objects.select_related('work', 'screen_work').all()
    serializer_class = AdaptationEdgeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['work', 'screen_work', 'relation_type']
