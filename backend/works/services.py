"""Business logic services for works app."""
import re
from typing import Optional
from django.db.models import QuerySet, Count, Q, F, FloatField, ExpressionWrapper
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


class SearchService:
    """Service class for comparison-first search logic."""

    @staticmethod
    def detect_screen_search(query: str) -> Optional[int]:
        """
        Detect if search query is for a specific screen adaptation by year.
        Returns year if detected, None otherwise.

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
    def search_works_with_adaptations(query: str, limit: int = 20) -> QuerySet:
        """
        Search for works with their ranked adaptations.

        Returns Work queryset with ranked_adaptations attribute attached.
        Uses fuzzy matching with PostgreSQL trigrams for typo tolerance.
        """
        from django.contrib.postgres.search import TrigramSimilarity
        from django.db.models import Case, When, IntegerField, Value, Max

        # First try exact/contains matches
        exact_matches = Work.objects.filter(
            Q(title__icontains=query) | Q(author__icontains=query) | Q(summary__icontains=query)
        ).annotate(
            relevance_rank=Case(
                When(title__icontains=query, then=Value(3)),
                When(author__icontains=query, then=Value(2)),
                When(summary__icontains=query, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        )

        # If we have good exact matches, return those
        if exact_matches.count() >= 3:
            works = exact_matches.order_by('-relevance_rank', '-created_at')[:limit]
        else:
            # Use fuzzy matching with trigrams
            works = Work.objects.annotate(
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
            ).filter(
                Q(title_similarity__gte=0.2) | Q(author_similarity__gte=0.2)
            ).order_by('-max_similarity', '-created_at')[:limit]

        # Attach ranked adaptations to each work
        for work in works:
            work.ranked_adaptations = list(SearchService.get_ranked_adaptations_for_work(work))

        return works

    @staticmethod
    def search_screen_works(query: str, year: Optional[int] = None, limit: int = 20) -> QuerySet:
        """
        Search for screen works directly (for screen-first searches).

        If year is provided, filter by year.
        Uses fuzzy matching for typo tolerance.
        """
        from django.contrib.postgres.search import TrigramSimilarity
        from django.db.models import Case, When, IntegerField, Value

        # First try exact/contains matches
        filters = Q(title__icontains=query) | Q(summary__icontains=query)

        if year:
            filters &= Q(year=year)

        exact_matches = ScreenWork.objects.filter(filters).annotate(
            relevance_rank=Case(
                When(title__icontains=query, then=Value(2)),
                When(summary__icontains=query, then=Value(1)),
                default=Value(0),
                output_field=IntegerField()
            )
        )

        # If we have good exact matches, return those
        if exact_matches.count() >= 3:
            works = exact_matches.order_by('-relevance_rank', '-tmdb_popularity', '-year')[:limit]
        else:
            # Use fuzzy matching
            query_obj = ScreenWork.objects.annotate(
                title_similarity=TrigramSimilarity('title', query),
            ).filter(
                title_similarity__gte=0.2
            )

            if year:
                query_obj = query_obj.filter(year=year)

            works = query_obj.order_by('-title_similarity', '-tmdb_popularity', '-year')[:limit]

        return works
