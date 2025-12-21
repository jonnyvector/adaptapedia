"""Views for works app."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Work
from .serializers import WorkSerializer, WorkWithAdaptationsSerializer
from .services import SearchService
from screen.serializers import ScreenWorkSerializer


class WorkViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Work model (read-only for now)."""

    queryset = Work.objects.all()
    serializer_class = WorkSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary']
    filterset_fields = ['year']
    ordering_fields = ['title', 'year', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='search-with-adaptations')
    def search_with_adaptations(self, request):
        """
        Comparison-first search endpoint.

        Returns books with their ranked adaptations, or screen-first results if year detected.

        Query params:
        - q: search query (required)
        - limit: max results (default 20)
        """
        query = request.query_params.get('q', '').strip()

        if not query or len(query) < 2:
            return Response(
                {'error': 'Query parameter "q" must be at least 2 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        limit = int(request.query_params.get('limit', 20))

        # Check if this is a screen-first search (has year in query)
        detected_year = SearchService.detect_screen_search(query)

        if detected_year:
            # Remove year from query for cleaner search
            clean_query = query.rsplit(str(detected_year), 1)[0].strip('() ')

            # Search screen works directly
            screen_works = SearchService.search_screen_works(clean_query, year=detected_year, limit=limit)

            return Response({
                'search_type': 'screen',
                'query': query,
                'detected_year': detected_year,
                'results': ScreenWorkSerializer(screen_works, many=True).data
            })

        # Default: book-first search with adaptations
        works = SearchService.search_works_with_adaptations(query, limit=limit)

        return Response({
            'search_type': 'book',
            'query': query,
            'results': WorkWithAdaptationsSerializer(works, many=True).data
        })
