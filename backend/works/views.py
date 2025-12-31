"""Views for works app."""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from adaptapedia.throttles import SearchRateThrottle, PublicListRateThrottle
from .models import Work
from .serializers import WorkSerializer, WorkWithAdaptationsSerializer, GenreSerializer, SimilarBookSerializer
from .services import SearchService, SimilarBooksService
from screen.serializers import ScreenWorkSerializer


class WorkPagination(PageNumberPagination):
    """Pagination for work list endpoints."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class WorkViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Work model (read-only for now)."""

    queryset = Work.objects.all()
    serializer_class = WorkSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'summary']
    filterset_fields = ['year', 'genre']
    ordering_fields = ['title', 'year', 'created_at']
    ordering = ['-created_at']
    pagination_class = WorkPagination
    throttle_classes = [PublicListRateThrottle]

    @action(detail=False, methods=['get'], url_path='search-with-adaptations', throttle_classes=[SearchRateThrottle])
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
        works, total_count = SearchService.search_works_with_adaptations(query, limit=limit)

        return Response({
            'search_type': 'book',
            'query': query,
            'total_count': total_count,
            'results': WorkWithAdaptationsSerializer(works, many=True).data
        })

    @action(detail=False, methods=['get'], url_path='genres')
    def genres(self, request):
        """
        List all available genres with book counts.

        Returns genres sorted by book count (most popular first).
        """
        # Get all unique genres with book counts
        genres = Work.objects.values('genre').annotate(
            book_count=Count('id')
        ).filter(
            genre__isnull=False,
            genre__gt=''
        ).order_by('-book_count')

        return Response({
            'results': GenreSerializer(genres, many=True).data
        })

    @action(detail=False, methods=['get'], url_path='by-genre/(?P<genre>[^/.]+)')
    def by_genre(self, request, genre=None):
        """
        Get works by genre with their adaptations.

        Query params:
        - page: page number (default 1)
        - page_size: results per page (default 20, max 100)
        """
        if not genre:
            return Response(
                {'error': 'Genre parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # URL decode and normalize genre
        import urllib.parse
        genre_decoded = urllib.parse.unquote(genre).replace('-', ' ')

        # Get works for this genre
        works = Work.objects.filter(
            genre__iexact=genre_decoded
        ).select_related().prefetch_related('adaptations')

        # Apply pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(works, request)

        # Attach ranked adaptations to each work
        for work in page:
            work.ranked_adaptations = list(SearchService.get_ranked_adaptations_for_work(work))

        return paginator.get_paginated_response(
            WorkWithAdaptationsSerializer(page, many=True).data
        )

    @action(detail=True, methods=['get'], url_path='similar')
    def similar_books(self, request, slug=None):
        """
        Get similar books for a given work.

        Uses multi-criteria similarity algorithm:
        - Genre match (highest priority)
        - Same author
        - Similar title words (trigram matching)
        - Adaptation count boost

        Query params:
        - limit: max similar books to return (default 6, max 20)

        Returns up to 6 similar books with their adaptation counts.
        """
        work = self.get_object()

        # Get limit from query params
        limit = int(request.query_params.get('limit', 6))
        limit = min(limit, 20)  # Cap at 20 max

        # Get similar books using service
        similar_books = SimilarBooksService.get_similar_books(work, limit=limit)

        return Response({
            'results': SimilarBookSerializer(similar_books, many=True).data,
            'count': len(similar_books),
        })

    @action(detail=False, methods=['get'], url_path='catalog')
    def catalog(self, request):
        """
        Get all books with their adaptations for catalog page.

        Query params:
        - sort: 'title' (default), 'year', 'adaptations'
        - order: 'asc' (default), 'desc'
        - filter: 'all' (default), 'with-covers', 'without-covers'

        Returns all books with adaptation counts and cover URLs.
        """
        from screen.models import AdaptationEdge

        # Get query params
        sort_by = request.query_params.get('sort', 'title')
        order = request.query_params.get('order', 'asc')
        filter_type = request.query_params.get('filter', 'all')

        # Base queryset
        queryset = Work.objects.all()

        # Apply filters
        if filter_type == 'with-covers':
            queryset = queryset.exclude(cover_url__isnull=True).exclude(cover_url='')
        elif filter_type == 'without-covers':
            queryset = queryset.filter(cover_url__isnull=True) | queryset.filter(cover_url='')

        # Annotate with adaptation count
        queryset = queryset.annotate(
            adaptation_count=Count('adaptations')
        )

        # Apply sorting
        sort_field = {
            'title': 'title',
            'year': 'year',
            'adaptations': 'adaptation_count',
        }.get(sort_by, 'title')

        if order == 'desc':
            sort_field = f'-{sort_field}'

        queryset = queryset.order_by(sort_field)

        # Build response with adaptation details
        results = []
        for work in queryset:
            # Get adaptations for this work
            adaptations = AdaptationEdge.objects.filter(
                work=work
            ).select_related('screen_work').order_by('screen_work__year')

            adaptation_list = [{
                'id': edge.screen_work.id,
                'title': edge.screen_work.title,
                'year': edge.screen_work.year,
                'type': edge.screen_work.type,
                'slug': edge.screen_work.slug,
                'poster_url': edge.screen_work.poster_url,
            } for edge in adaptations]

            results.append({
                'id': work.id,
                'title': work.title,
                'author': work.author,
                'year': work.year,
                'slug': work.slug,
                'cover_url': work.cover_url,
                'adaptation_count': len(adaptation_list),
                'adaptations': adaptation_list,
            })

        return Response({
            'count': len(results),
            'results': results,
        })
