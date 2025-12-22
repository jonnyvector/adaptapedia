"""Business logic services for diffs app."""
from typing import Optional
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q, F, FloatField, ExpressionWrapper
from .models import DiffItem, DiffVote, DiffComment

User = get_user_model()


class DiffService:
    """Service class for Diff-related business logic."""

    @staticmethod
    def create_diff(
        work_id: int,
        screen_work_id: int,
        category: str,
        claim: str,
        spoiler_scope: str,
        user: User,
        detail: str = "",
    ) -> DiffItem:
        """Create a new diff item."""
        diff = DiffItem.objects.create(
            work_id=work_id,
            screen_work_id=screen_work_id,
            category=category,
            claim=claim,
            detail=detail,
            spoiler_scope=spoiler_scope,
            created_by=user,
        )
        return diff

    @staticmethod
    def vote_on_diff(diff_id: int, user: User, vote_type: str) -> DiffVote:
        """Vote on a diff (creates or updates existing vote)."""
        vote, created = DiffVote.objects.update_or_create(
            diff_item_id=diff_id,
            user=user,
            defaults={'vote': vote_type}
        )
        return vote

    @staticmethod
    def add_comment(diff_id: int, user: User, body: str, spoiler_scope: str) -> DiffComment:
        """Add a comment to a diff."""
        comment = DiffComment.objects.create(
            diff_item_id=diff_id,
            user=user,
            body=body,
            spoiler_scope=spoiler_scope,
        )
        return comment

    @staticmethod
    def get_diffs_for_comparison(
        work_id: int,
        screen_work_id: int,
        max_spoiler_scope: Optional[str] = None
    ) -> list[DiffItem]:
        """Get all diffs for a specific book-screen comparison."""
        queryset = DiffItem.objects.filter(
            work_id=work_id,
            screen_work_id=screen_work_id,
            status='LIVE'
        ).select_related('work', 'screen_work', 'created_by').prefetch_related('votes')

        if max_spoiler_scope:
            # Apply spoiler filtering
            from .models import SpoilerScope
            scope_order = {
                SpoilerScope.NONE: 0,
                SpoilerScope.BOOK_ONLY: 1,
                SpoilerScope.SCREEN_ONLY: 1,
                SpoilerScope.FULL: 2,
            }
            max_level = scope_order.get(max_spoiler_scope, 0)
            allowed_scopes = [k for k, v in scope_order.items() if v <= max_level]
            queryset = queryset.filter(spoiler_scope__in=allowed_scopes)

        return list(queryset)

    @staticmethod
    def get_trending_comparisons(limit: int = 8, days: int = 7) -> list[dict]:
        """
        Get trending comparisons based on recent activity.

        Trending algorithm:
        1. Recent activity (diffs added or votes cast in last N days)
        2. Volume of activity (number of recent diffs + votes)
        3. Diversity (prefer different books, not all from same book)

        Args:
            limit: Number of trending comparisons to return (default 8)
            days: Number of days to look back for activity (default 7)

        Returns:
            List of dicts with comparison metadata:
            {
                'work_id': int,
                'work_title': str,
                'work_slug': str,
                'screen_work_id': int,
                'screen_work_title': str,
                'screen_work_slug': str,
                'screen_work_type': str,
                'screen_work_year': int,
                'total_diffs': int,
                'recent_diffs': int,
                'recent_votes': int,
                'activity_score': float,
            }
        """
        from works.models import Work
        from screen.models import ScreenWork

        # Calculate the cutoff date for "recent" activity
        cutoff_date = timezone.now() - timedelta(days=days)

        # Get all comparisons (work + screen_work pairs) with activity metrics
        # We need to group by work_id and screen_work_id
        comparisons = DiffItem.objects.filter(
            status='LIVE'
        ).values(
            'work_id', 'screen_work_id'
        ).annotate(
            # Total number of diffs for this comparison
            total_diffs=Count('id', distinct=True),
            # Recent diffs (created in last N days)
            recent_diffs=Count(
                'id',
                filter=Q(created_at__gte=cutoff_date),
                distinct=True
            ),
            # Recent votes (cast in last N days on any diff in this comparison)
            recent_votes=Count(
                'votes',
                filter=Q(votes__created_at__gte=cutoff_date),
                distinct=True
            ),
        ).annotate(
            # Activity score: (recent_diffs * 3) + (recent_votes * 1)
            # Weight new diffs more heavily than votes to encourage new content
            activity_score=ExpressionWrapper(
                (F('recent_diffs') * 3.0) + (F('recent_votes') * 1.0),
                output_field=FloatField()
            )
        ).filter(
            # Only include comparisons with recent activity
            activity_score__gt=0
        ).order_by(
            '-activity_score', '-recent_diffs', '-total_diffs'
        )

        # Fetch the top comparisons with diversity
        # First, collect the IDs we need to fetch
        work_ids_to_fetch = set()
        screen_work_ids_to_fetch = set()
        comparisons_list = []
        max_per_work = 2  # Maximum comparisons from the same book

        for comparison in comparisons:
            work_id = comparison['work_id']

            # Diversity check: limit comparisons from same book
            work_count = sum(1 for c in comparisons_list if c['work_id'] == work_id)
            if work_count >= max_per_work:
                continue

            comparisons_list.append(comparison)
            work_ids_to_fetch.add(work_id)
            screen_work_ids_to_fetch.add(comparison['screen_work_id'])

            # Stop when we have enough results
            if len(comparisons_list) >= limit:
                break

        # Bulk fetch all needed works and screen works to avoid N+1 queries
        works = {w.id: w for w in Work.objects.filter(id__in=work_ids_to_fetch)}
        screen_works = {s.id: s for s in ScreenWork.objects.filter(id__in=screen_work_ids_to_fetch)}

        # Build the final results
        results = []
        for comparison in comparisons_list:
            work = works[comparison['work_id']]
            screen_work = screen_works[comparison['screen_work_id']]

            results.append({
                'work_id': work.id,
                'work_title': work.title,
                'work_slug': work.slug,
                'cover_url': work.cover_url,
                'screen_work_id': screen_work.id,
                'screen_work_title': screen_work.title,
                'screen_work_slug': screen_work.slug,
                'screen_work_type': screen_work.get_type_display(),
                'screen_work_year': screen_work.year,
                'poster_url': screen_work.poster_url,
                'total_diffs': comparison['total_diffs'],
                'recent_diffs': comparison['recent_diffs'],
                'recent_votes': comparison['recent_votes'],
                'activity_score': float(comparison['activity_score']),
            })

        return results
