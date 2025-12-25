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
    def search_works_with_adaptations(query: str, limit: int = 20) -> tuple[QuerySet, int]:
        """
        Search for works with their ranked adaptations.

        Returns tuple of (Work queryset with ranked_adaptations, total_count).
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
            total_count = exact_matches.count()
            works = exact_matches.order_by('-relevance_rank', '-created_at')[:limit]
        else:
            # Use fuzzy matching with trigrams
            fuzzy_matches = Work.objects.annotate(
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
            ).order_by('-max_similarity', '-created_at')

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
