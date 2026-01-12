"""Business logic services for works app."""
import re
from typing import Optional, List, Dict, Any
from django.db.models import QuerySet, Count, Q, F, FloatField, ExpressionWrapper, Prefetch
from .models import Work
from screen.models import ScreenWork, AdaptationEdge


class WorkService:
    """Service class for Work-related business logic."""

    @staticmethod
    def get_or_create_from_wikidata(qid: str, title: str, **kwargs) -> tuple[Work, bool]:
        """Get or create a Work from Wikidata QID."""
        work, created = Work.objects.get_or_create(
            wikidata_qid=qid,
            defaults={'title': title, **kwargs}
        )
        return work, created

    @staticmethod
    def get_or_create_from_openlibrary(ol_work_id: str, title: str, **kwargs) -> tuple[Work, bool]:
        """Get or create a Work from Open Library work ID."""
        work, created = Work.objects.get_or_create(
            openlibrary_work_id=ol_work_id,
            defaults={'title': title, **kwargs}
        )
        return work, created

    @staticmethod
    def get_catalog(
        sort_by: str = 'title',
        order: str = 'asc',
        filter_type: str = 'all',
        letter: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Dict[str, Any]:
        """
        Get books with their adaptations for catalog page with letter-based pagination.

        Args:
            sort_by: 'title' (default), 'year', or 'adaptations'
            order: 'asc' (default) or 'desc'
            filter_type: 'all' (default), 'with-covers', or 'without-covers'
            letter: Filter by first letter (A-Z or #). If None, returns all books
            page: Page number (1-indexed)
            page_size: Number of books per page (default 50)

        Returns:
            Dict with results, pagination metadata, and available letters
        """
        # Base queryset
        queryset = Work.objects.all()

        # Apply cover filters
        if filter_type == 'with-covers':
            queryset = queryset.exclude(cover_url__isnull=True).exclude(cover_url='')
        elif filter_type == 'without-covers':
            queryset = queryset.filter(Q(cover_url__isnull=True) | Q(cover_url=''))

        # Annotate with adaptation count for sorting
        queryset = queryset.annotate(
            adaptation_count=Count('adaptations')
        )

        # Apply letter filter
        if letter:
            if letter == '#':
                # Filter for titles starting with numbers
                queryset = queryset.filter(title__regex=r'^[0-9]')
            else:
                # Filter for titles starting with the letter
                # Handle "The" prefix: "The Lord" should be under "L"
                letter_upper = letter.upper()
                queryset = queryset.filter(
                    Q(title__istartswith=letter_upper) |
                    Q(title__istartswith=f'The {letter_upper}')
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

        # Get total count before pagination
        total_count = queryset.count()
        total_pages = (total_count + page_size - 1) // page_size  # Ceiling division

        # Apply pagination
        start = (page - 1) * page_size
        end = start + page_size
        paginated_queryset = queryset[start:end]

        # Prefetch adaptations to avoid N+1 queries
        adaptations_prefetch = Prefetch(
            'adaptations',
            queryset=AdaptationEdge.objects.select_related('screen_work').order_by('screen_work__year')
        )

        paginated_queryset = paginated_queryset.prefetch_related(adaptations_prefetch)

        # Build results
        results = []
        for work in paginated_queryset:
            adaptation_list = [{
                'id': edge.screen_work.id,
                'title': edge.screen_work.title,
                'year': edge.screen_work.year,
                'type': edge.screen_work.type,
                'slug': edge.screen_work.slug,
                'poster_url': edge.screen_work.poster_url,
            } for edge in work.adaptations.all()]

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

        # Get available letters (with counts) - more efficiently
        # Use raw SQL to get first character counts without loading all objects
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT
                    CASE
                        WHEN LOWER(LEFT(title, 4)) = 'the ' AND LENGTH(title) > 4
                            THEN UPPER(SUBSTRING(title, 5, 1))
                        ELSE UPPER(LEFT(title, 1))
                    END as first_char,
                    COUNT(*) as count
                FROM works_work
                GROUP BY first_char
                ORDER BY first_char
            """)
            rows = cursor.fetchall()

        letter_counts = {}
        for first_char, count in rows:
            # Group numbers under #
            if first_char and first_char[0].isdigit():
                letter_counts['#'] = letter_counts.get('#', 0) + count
            elif first_char:
                letter_counts[first_char] = count

        available_letters = sorted(letter_counts.keys(), key=lambda x: (x == '#', x))

        return {
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page,
            'page_size': page_size,
            'has_next': page < total_pages,
            'has_prev': page > 1,
            'results': results,
            'available_letters': available_letters,
            'letter_counts': letter_counts,
        }


class SimilarBooksService:
    """Service class for finding similar books."""

    @staticmethod
    def get_similar_books(work: Work, limit: int = 6) -> QuerySet:
        """
        Find similar books based on multiple criteria.

        Ranking algorithm:
        1. Genre match (highest priority) - 10 points
        2. Same author - 5 points
        3. Similar title words (optional) - up to 3 points per matching word
        4. Adaptation count boost - up to 2 points

        Args:
            work: The Work instance to find similar books for
            limit: Maximum number of similar books to return (default 6)

        Returns:
            QuerySet of Work objects ordered by similarity score
        """
        from django.db.models import Case, When, Value, IntegerField, Count
        from django.contrib.postgres.search import TrigramSimilarity

        # Exclude the current work from results
        similar_works = Work.objects.exclude(id=work.id)

        # Build scoring query
        score_cases = []

        # 1. Genre match (10 points) - highest priority
        if work.genre:
            score_cases.append(
                When(genre__iexact=work.genre, then=Value(10))
            )

        # 2. Author match (5 points)
        if work.author:
            score_cases.append(
                When(author__iexact=work.author, then=Value(5))
            )

        # Annotate with adaptation count for boost
        similar_works = similar_works.annotate(
            adaptation_count=Count('adaptations', distinct=True)
        )

        # Calculate base similarity score
        if score_cases:
            similar_works = similar_works.annotate(
                base_score=Case(
                    *score_cases,
                    default=Value(0),
                    output_field=IntegerField()
                )
            )
        else:
            similar_works = similar_works.annotate(
                base_score=Value(0, output_field=IntegerField())
            )

        # 3. Title similarity using trigrams (if available)
        if work.title:
            similar_works = similar_works.annotate(
                title_similarity=TrigramSimilarity('title', work.title)
            )
        else:
            similar_works = similar_works.annotate(
                title_similarity=Value(0.0, output_field=FloatField())
            )

        # 4. Calculate final score with all factors
        # base_score + (title_similarity * 3) + min(adaptation_count, 2)
        similar_works = similar_works.annotate(
            similarity_score=ExpressionWrapper(
                F('base_score') + (F('title_similarity') * 3.0) +
                Case(
                    When(adaptation_count__gte=2, then=Value(2.0)),
                    default=F('adaptation_count') * 1.0,
                    output_field=FloatField()
                ),
                output_field=FloatField()
            )
        )

        # Filter to only include works with some similarity
        # (genre match OR author match OR title similarity > 0.2)
        filter_condition = Q(similarity_score__gt=0)
        if work.title:
            filter_condition |= Q(title_similarity__gte=0.2)

        similar_works = similar_works.filter(filter_condition)

        # Order by similarity score (highest first) and limit results
        similar_works = similar_works.order_by('-similarity_score', '-adaptation_count', '-created_at')[:limit]

        return similar_works


class SearchService:
    """Service class for comparison-first search logic."""

    @staticmethod
    def detect_screen_search(query: str) -> Optional[int]:
        """
        Detect if search query is for a specific screen adaptation by year.

        Args:
            query: Search query string to parse for year

        Returns:
            Year as integer if detected in query (e.g., 1980, 2021), None otherwise

        Examples:
            "The Shining 1980" -> 1980
            "The Shining (1980)" -> 1980
            "Dune 2021" -> 2021
        """
        # Match patterns like "Title 1980" or "Title (1980)"
        year_pattern = r'\(?\b(19\d{2}|20\d{2})\)?$'
        match = re.search(year_pattern, query.strip())

        if match:
            return int(match.group(1))
        return None

    @staticmethod
    def get_ranked_adaptations_for_work(work: Work) -> QuerySet:
        """
        Get ranked screen adaptations for a book work.

        Ranking criteria:
        1. TMDb popularity score
        2. Engagement score (diff count + vote count)
        3. Recency (newer adaptations get slight boost)

        Returns QuerySet with annotated engagement_score and rank_score.
        """
        from django.db.models import Max

        # Get all adaptations via AdaptationEdge
        adaptation_edges = AdaptationEdge.objects.filter(work=work).values_list('screen_work_id', flat=True)

        # Get screen works with engagement metrics
        # Note: Filter diffs by BOTH work_id and screen_work_id for this specific pairing
        screen_works = ScreenWork.objects.filter(
            id__in=adaptation_edges
        ).annotate(
            # Count diffs for this specific book→screen pairing
            diff_count=Count('diffs', filter=Q(diffs__status='LIVE', diffs__work=work), distinct=True),
            # Count votes on those diffs for this pairing
            vote_count=Count('diffs__votes', filter=Q(diffs__status='LIVE', diffs__work=work), distinct=True),
            # Get most recent diff update timestamp for this pairing
            last_diff_updated=Max('diffs__updated_at', filter=Q(diffs__status='LIVE', diffs__work=work)),
            # Engagement score = diffs + (votes / 10)
            engagement_score=ExpressionWrapper(
                F('diff_count') + (F('vote_count') / 10.0),
                output_field=FloatField()
            ),
            # Recency boost: newer = higher (max boost of 10 points)
            recency_boost=ExpressionWrapper(
                (F('year') - 1900) / 10.0,
                output_field=FloatField()
            ),
            # Final rank score: tmdb_popularity + engagement_score*5 + recency_boost
            rank_score=ExpressionWrapper(
                F('tmdb_popularity') + (F('engagement_score') * 5.0) + F('recency_boost'),
                output_field=FloatField()
            )
        ).order_by('-rank_score', '-year', 'title')

        return screen_works

    @staticmethod
    def search_works_with_adaptations(query: str, limit: int = 20) -> tuple[QuerySet, int]:
        """
        Search for works with their ranked adaptations.

        Returns tuple of (Work queryset with ranked_adaptations, total_count).
        Uses intelligent ranking with exact match, starts-with, whole-word, and fuzzy matching.

        Ranking priority:
        1. Exact title match (100 pts)
        2. Title starts with query (70 pts)
        3. Whole word in title (50 pts)
        4. Title contains query (30 pts)
        5. Author matches (60% of title scores: 60, 42, 30, 18 pts)
        6. Summary contains (10 pts)
        7. Popularity boost from adaptation count (+2 pts per adaptation)
        """
        from django.contrib.postgres.search import TrigramSimilarity
        from django.db.models import Case, When, IntegerField, Value, Max

        # Escape special regex characters in query
        escaped_query = re.escape(query)

        # Search with improved ranking
        search_results = Work.objects.filter(
            Q(title__icontains=query) | Q(author__icontains=query) | Q(summary__icontains=query)
        ).annotate(
            # Count adaptations for popularity boost
            adaptation_count=Count('adaptations', distinct=True),
            # Hierarchical relevance ranking
            relevance_rank=Case(
                # Title matches (highest priority)
                When(title__iexact=query, then=Value(100)),  # Exact: "It" = "It"
                When(title__istartswith=query + ' ', then=Value(70)),  # Starts: "It Ends with Us"
                When(title__iregex=rf'\b{escaped_query}\b', then=Value(50)),  # Whole word: "The It Crowd"
                When(title__icontains=query, then=Value(30)),  # Contains: "Spitfire Grill"

                # Author matches (60% of title scores)
                When(author__iexact=query, then=Value(60)),
                When(author__istartswith=query + ' ', then=Value(42)),
                When(author__iregex=rf'\b{escaped_query}\b', then=Value(30)),
                When(author__icontains=query, then=Value(18)),

                # Summary match (lowest priority)
                When(summary__icontains=query, then=Value(10)),

                default=Value(0),
                output_field=IntegerField()
            ),
            # Final score = relevance + popularity boost
            final_score=ExpressionWrapper(
                F('relevance_rank') + (F('adaptation_count') * 2),
                output_field=IntegerField()
            )
        )

        # If we have good matches, return those
        if search_results.count() >= 3:
            total_count = search_results.count()
            works = search_results.order_by('-final_score', '-created_at')[:limit]
        else:
            # Use fuzzy matching with trigrams for typo tolerance
            fuzzy_matches = Work.objects.annotate(
                adaptation_count=Count('adaptations', distinct=True),
                title_similarity=TrigramSimilarity('title', query),
                author_similarity=TrigramSimilarity('author', query),
                # Calculate max similarity across fields
                max_similarity=Max(
                    Case(
                        When(title_similarity__gte=F('author_similarity'), then=F('title_similarity')),
                        default=F('author_similarity'),
                        output_field=FloatField()
                    )
                ),
                # Boost score with adaptation count
                final_score=ExpressionWrapper(
                    (F('max_similarity') * 100) + (F('adaptation_count') * 2),
                    output_field=FloatField()
                )
            ).filter(
                Q(title_similarity__gte=0.2) | Q(author_similarity__gte=0.2)
            ).order_by('-final_score', '-created_at')

            total_count = fuzzy_matches.count()
            works = fuzzy_matches[:limit]

        # Attach ranked adaptations to each work
        for work in works:
            work.ranked_adaptations = list(SearchService.get_ranked_adaptations_for_work(work))

        return works, total_count

    @staticmethod
    def search_screen_works(query: str, year: Optional[int] = None, limit: int = 20) -> QuerySet:
        """
        Search for screen works directly (for screen-first searches).

        If year is provided, filter by year.
        Uses intelligent ranking with exact match, starts-with, whole-word, and fuzzy matching.

        Ranking priority:
        1. Exact title match (100 pts)
        2. Title starts with query (70 pts)
        3. Whole word in title (50 pts)
        4. Title contains query (30 pts)
        5. Summary contains (10 pts)
        6. TMDb popularity boost
        """
        from django.contrib.postgres.search import TrigramSimilarity
        from django.db.models import Case, When, IntegerField, Value

        # Escape special regex characters in query
        escaped_query = re.escape(query)

        # Build filters
        filters = Q(title__icontains=query) | Q(summary__icontains=query)

        if year:
            filters &= Q(year=year)

        # Search with improved ranking
        search_results = ScreenWork.objects.filter(filters).annotate(
            relevance_rank=Case(
                # Title matches (highest priority)
                When(title__iexact=query, then=Value(100)),
                When(title__istartswith=query + ' ', then=Value(70)),
                When(title__iregex=rf'\b{escaped_query}\b', then=Value(50)),
                When(title__icontains=query, then=Value(30)),

                # Summary match
                When(summary__icontains=query, then=Value(10)),

                default=Value(0),
                output_field=IntegerField()
            ),
            # Final score = relevance + (tmdb_popularity / 10) for slight boost
            final_score=ExpressionWrapper(
                F('relevance_rank') + (F('tmdb_popularity') / 10.0),
                output_field=FloatField()
            )
        )

        # If we have good matches, return those
        if search_results.count() >= 3:
            works = search_results.order_by('-final_score', '-year')[:limit]
        else:
            # Use fuzzy matching with trigrams
            query_obj = ScreenWork.objects.annotate(
                title_similarity=TrigramSimilarity('title', query),
                final_score=ExpressionWrapper(
                    (F('title_similarity') * 100) + (F('tmdb_popularity') / 10.0),
                    output_field=FloatField()
                )
            ).filter(
                title_similarity__gte=0.2
            )

            if year:
                query_obj = query_obj.filter(year=year)

            works = query_obj.order_by('-final_score', '-year')[:limit]

        return works
