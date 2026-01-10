"""Business logic services for diffs app."""
from typing import Optional, Dict, Any, List
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Q, F, FloatField, ExpressionWrapper, Max, Case, When, IntegerField
from .models import DiffItem, DiffVote, DiffComment
from .constants import (
    CURATED_WORK_IDS,
    SPOILER_SCOPE_ORDER,
    TRENDING_LOOKBACK_DAYS,
    TRENDING_MAX_PER_WORK,
    TRENDING_DIFF_WEIGHT,
    TRENDING_VOTE_WEIGHT,
    FEATURED_DIFF_WEIGHT,
    FEATURED_VOTE_WEIGHT,
    MIN_VOTES_FOR_DISPUTE,
    DISPUTE_ACCURACY_MIN,
    DISPUTE_ACCURACY_MAX,
    RECENTLY_UPDATED_HOURS,
)

User = get_user_model()


class DiffService:
    """Service class for Diff-related business logic."""

    @staticmethod
    def _get_comparison_votes(work_ids: list[int], screen_work_ids: list[int]) -> Dict[tuple[int, int], int]:
        """
        Get comparison vote counts for multiple work/screen work pairs.

        Single query with GROUP BY - replaced N*M query loop.
        Returns dict with (work_id, screen_work_id) tuples as keys and vote counts as values.
        """
        from diffs.models import ComparisonVote

        # Single query with GROUP BY - much more efficient than nested loops
        votes = ComparisonVote.objects.filter(
            work_id__in=work_ids,
            screen_work_id__in=screen_work_ids
        ).values('work_id', 'screen_work_id').annotate(
            count=Count('id')
        )

        # Build dict from results
        comparison_votes = {
            (vote['work_id'], vote['screen_work_id']): vote['count']
            for vote in votes
        }

        return comparison_votes

    @staticmethod
    def _bulk_fetch_works_and_screens(
        work_ids: List[int], screen_work_ids: List[int]
    ) -> tuple[Dict[int, Any], Dict[int, Any]]:
        """
        Bulk fetch works and screen works by IDs to avoid N+1 queries.

        Returns:
            Tuple of (works_dict, screen_works_dict) where keys are IDs.
        """
        from works.models import Work
        from screen.models import ScreenWork

        works = {w.id: w for w in Work.objects.filter(id__in=work_ids)}
        screen_works = {s.id: s for s in ScreenWork.objects.filter(id__in=screen_work_ids)}

        return works, screen_works

    @staticmethod
    def _build_comparison_dict(
        work: Any,
        screen_work: Any,
        diff_count: int = 0,
        vote_count: int = 0,
        comparison_vote_count: int = 0,
        **extra_fields
    ) -> Dict[str, Any]:
        """
        Build a standardized comparison dictionary for API responses.

        Args:
            work: Work model instance
            screen_work: ScreenWork model instance
            diff_count: Number of diffs for this comparison
            vote_count: Number of diff votes for this comparison
            comparison_vote_count: Number of comparison votes
            **extra_fields: Additional fields to include (activity_score, last_updated, etc.)

        Returns:
            Dictionary with standardized comparison fields
        """
        result = {
            'work_id': work.id,
            'work_title': work.title,
            'work_slug': work.slug,
            'work_author': work.author,
            'work_year': work.year,
            'cover_url': work.cover_url,
            'screen_work_id': screen_work.id,
            'screen_work_title': screen_work.title,
            'screen_work_slug': screen_work.slug,
            'screen_work_type': screen_work.get_type_display(),
            'screen_work_year': screen_work.year,
            'poster_url': screen_work.poster_url,
            'diff_count': diff_count,
            'vote_count': vote_count,
            'comparison_vote_count': comparison_vote_count,
        }
        # Add any extra fields
        result.update(extra_fields)
        return result

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
            # Apply spoiler filtering using constant
            max_level = SPOILER_SCOPE_ORDER.get(max_spoiler_scope, 0)
            allowed_scopes = [k for k, v in SPOILER_SCOPE_ORDER.items() if v <= max_level]
            queryset = queryset.filter(spoiler_scope__in=allowed_scopes)

        return list(queryset)

    @staticmethod
    def _get_trending_query(cutoff_date):
        """Build the trending comparisons query with activity metrics."""
        return DiffItem.objects.filter(
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
            # Activity score: (recent_diffs * weight) + (recent_votes * weight)
            # Weight new diffs more heavily than votes to encourage new content
            activity_score=ExpressionWrapper(
                (F('recent_diffs') * TRENDING_DIFF_WEIGHT) + (F('recent_votes') * TRENDING_VOTE_WEIGHT),
                output_field=FloatField()
            )
        ).filter(
            # Only include comparisons with recent activity
            activity_score__gt=0
        ).order_by(
            '-activity_score', '-recent_diffs', '-total_diffs'
        )

    @staticmethod
    def _apply_diversity_filter(comparisons, limit: int, max_per_work: int = TRENDING_MAX_PER_WORK) -> tuple:
        """
        Apply diversity filtering to limit comparisons from the same work.

        Returns tuple of (comparisons_list, work_ids, screen_work_ids) for bulk fetching.
        """
        work_ids_to_fetch = set()
        screen_work_ids_to_fetch = set()
        comparisons_list = []

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

        return comparisons_list, list(work_ids_to_fetch), list(screen_work_ids_to_fetch)

    @staticmethod
    def get_trending_comparisons(limit: int = 8, days: int = 7) -> List[Dict[str, Any]]:
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
            List of dicts with comparison metadata (work details, activity metrics, etc.)
        """
        # Calculate cutoff date and get trending comparisons
        cutoff_date = timezone.now() - timedelta(days=TRENDING_LOOKBACK_DAYS)
        comparisons = DiffService._get_trending_query(cutoff_date)

        # Apply diversity filtering
        comparisons_list, work_ids_to_fetch, screen_work_ids_to_fetch = DiffService._apply_diversity_filter(
            comparisons, limit
        )

        # Bulk fetch all needed works and screen works
        works, screen_works = DiffService._bulk_fetch_works_and_screens(
            work_ids_to_fetch, screen_work_ids_to_fetch
        )

        # Get comparison vote counts
        comparison_votes = DiffService._get_comparison_votes(list(work_ids_to_fetch), list(screen_work_ids_to_fetch))

        # Build the final results
        results = []
        for comparison in comparisons_list:
            work = works[comparison['work_id']]
            screen_work = screen_works[comparison['screen_work_id']]

            results.append(DiffService._build_comparison_dict(
                work=work,
                screen_work=screen_work,
                diff_count=comparison['total_diffs'],
                vote_count=0,  # Not tracked for trending
                comparison_vote_count=comparison_votes.get((work.id, screen_work.id), 0),
                # Extra fields specific to trending
                total_diffs=comparison['total_diffs'],
                recent_diffs=comparison['recent_diffs'],
                recent_votes=comparison['recent_votes'],
                activity_score=float(comparison['activity_score']),
            ))

        return results

    @staticmethod
    def get_featured_comparisons(limit: int = 12) -> List[Dict[str, Any]]:
        """
        Get featured comparisons with highest overall engagement.

        Featured algorithm:
        - Curated work IDs get priority
        - Total diffs (weighted 2x)
        - Total votes
        - Recent activity boost

        Returns list of comparison dicts with metadata.
        """
        from works.models import Work
        from screen.models import ScreenWork

        # Curated work IDs - only these will appear in featured
        # Lord of the Rings, Jurassic Park, Harry Potter, It, Dune, Hunger Games, The Shining, Fight Club
        CURATED_WORK_IDS = [1, 12, 9, 23, 10, 11, 22, 38]

        comparisons = DiffItem.objects.filter(
            status='LIVE',
            work_id__in=CURATED_WORK_IDS  # Only show curated works
        ).values(
            'work_id', 'screen_work_id'
        ).annotate(
            total_diffs=Count('id', distinct=True),
            total_votes=Count('votes', distinct=True),
            last_updated=Max('updated_at'),
        ).annotate(
            # Engagement score
            engagement_score=ExpressionWrapper(
                (F('total_diffs') * 2.0) + (F('total_votes') * 1.0),
                output_field=FloatField()
            )
        ).filter(
            total_diffs__gt=0
        ).order_by(
            '-engagement_score', '-last_updated'
        )[:limit]

        # Bulk fetch works and screen works
        work_ids = [c['work_id'] for c in comparisons]
        screen_work_ids = [c['screen_work_id'] for c in comparisons]
        works, screen_works = DiffService._bulk_fetch_works_and_screens(work_ids, screen_work_ids)

        # Get comparison vote counts for each comparison
        comparison_votes = DiffService._get_comparison_votes(work_ids, screen_work_ids)

        results = []
        for comparison in comparisons:
            work = works[comparison['work_id']]
            screen_work = screen_works[comparison['screen_work_id']]

            results.append(DiffService._build_comparison_dict(
                work=work,
                screen_work=screen_work,
                diff_count=comparison['total_diffs'],
                vote_count=comparison['total_votes'],
                comparison_vote_count=comparison_votes.get((work.id, screen_work.id), 0),
            ))

        return results

    @staticmethod
    def get_recently_updated(limit: int = 12) -> List[Dict[str, Any]]:
        """
        Get comparisons with recent activity (last 48 hours).
        """
        from works.models import Work
        from screen.models import ScreenWork

        cutoff = timezone.now() - timedelta(hours=48)

        comparisons = DiffItem.objects.filter(
            status='LIVE',
            updated_at__gte=cutoff
        ).values(
            'work_id', 'screen_work_id'
        ).annotate(
            total_diffs=Count('id', distinct=True),
            total_votes=Count('votes', distinct=True),
            last_updated=Max('updated_at'),
        ).order_by('-last_updated')[:limit]

        # Bulk fetch
        work_ids = [c['work_id'] for c in comparisons]
        screen_work_ids = [c['screen_work_id'] for c in comparisons]
        works, screen_works = DiffService._bulk_fetch_works_and_screens(work_ids, screen_work_ids)

        # Get comparison vote counts
        comparison_votes = DiffService._get_comparison_votes(work_ids, screen_work_ids)

        results = []
        for comparison in comparisons:
            work = works[comparison['work_id']]
            screen_work = screen_works[comparison['screen_work_id']]

            results.append(DiffService._build_comparison_dict(
                work=work,
                screen_work=screen_work,
                diff_count=comparison['total_diffs'],
                vote_count=comparison['total_votes'],
                comparison_vote_count=comparison_votes.get((work.id, screen_work.id), 0),
                last_updated=comparison['last_updated'],
            ))

        return results

    @staticmethod
    def get_most_documented(limit: int = 12) -> List[Dict[str, Any]]:
        """
        Get comparisons with the most diffs documented.
        """
        from works.models import Work
        from screen.models import ScreenWork

        comparisons = DiffItem.objects.filter(
            status='LIVE'
        ).values(
            'work_id', 'screen_work_id'
        ).annotate(
            total_diffs=Count('id', distinct=True),
            total_votes=Count('votes', distinct=True),
        ).filter(
            total_diffs__gt=0
        ).order_by('-total_diffs', '-total_votes')[:limit]

        # Bulk fetch
        work_ids = [c['work_id'] for c in comparisons]
        screen_work_ids = [c['screen_work_id'] for c in comparisons]
        works, screen_works = DiffService._bulk_fetch_works_and_screens(work_ids, screen_work_ids)

        # Get comparison vote counts
        comparison_votes = DiffService._get_comparison_votes(work_ids, screen_work_ids)

        results = []
        for comparison in comparisons:
            work = works[comparison['work_id']]
            screen_work = screen_works[comparison['screen_work_id']]

            results.append(DiffService._build_comparison_dict(
                work=work,
                screen_work=screen_work,
                diff_count=comparison['total_diffs'],
                vote_count=comparison['total_votes'],
                comparison_vote_count=comparison_votes.get((work.id, screen_work.id), 0),
            ))

        return results

    @staticmethod
    def _get_comparisons_needing_diffs(limit: int) -> List[Dict[str, Any]]:
        """Get comparisons with fewer than 3 diffs."""
        return list(DiffItem.objects.filter(
            status='LIVE'
        ).values(
            'work_id', 'screen_work_id'
        ).annotate(
            total_diffs=Count('id')
        ).filter(
            total_diffs__lt=3
        ).order_by('total_diffs', 'work_id', 'screen_work_id')[:limit])

    @staticmethod
    def _get_disputed_comparisons(limit: int) -> List[tuple]:
        """
        Get comparisons with controversial diffs that need discussion.

        Returns list of ((work_id, screen_id), data) tuples sorted by controversy.
        """
        disputed_by_comparison = {}
        disputed_diffs = DiffItem.objects.filter(
            status='LIVE'
        ).select_related('work', 'screen_work').annotate(
            accurate_count=Count('votes', filter=Q(votes__vote='ACCURATE'), distinct=True),
            disagree_count=Count('votes', filter=Q(votes__vote='DISAGREE'), distinct=True),
            nuance_count=Count('votes', filter=Q(votes__vote='NEEDS_NUANCE'), distinct=True),
        ).annotate(
            total_votes=F('accurate_count') + F('disagree_count') + F('nuance_count')
        ).filter(
            total_votes__gte=MIN_VOTES_FOR_DISPUTE
        )

        for diff in disputed_diffs:
            key = (diff.work_id, diff.screen_work_id)
            if key not in disputed_by_comparison:
                disputed_by_comparison[key] = {
                    'work': diff.work,
                    'screen_work': diff.screen_work,
                    'disputed_count': 0,
                    'total_votes': 0,
                }
            # Calculate controversy: more controversial when votes are split
            accurate = diff.accurate_count
            disagree = diff.disagree_count
            nuance = diff.nuance_count
            total = accurate + disagree + nuance
            if total > 0:
                accurate_pct = accurate / total
                is_controversial = DISPUTE_ACCURACY_MIN <= accurate_pct <= DISPUTE_ACCURACY_MAX
                if is_controversial:
                    disputed_by_comparison[key]['disputed_count'] += 1
                    disputed_by_comparison[key]['total_votes'] += total

        # Sort by number of disputed diffs
        return sorted(
            disputed_by_comparison.items(),
            key=lambda x: (x[1]['disputed_count'], x[1]['total_votes']),
            reverse=True
        )[:limit]

    @staticmethod
    def _get_uncommented_comparisons(limit: int) -> List[tuple]:
        """
        Get comparisons with diffs that have votes but no comments.

        Returns list of ((work_id, screen_id), data) tuples sorted by need.
        """
        no_comments_by_comparison = {}
        no_comments_diffs = DiffItem.objects.filter(
            status='LIVE'
        ).select_related('work', 'screen_work').annotate(
            comment_count=Count('comments', filter=Q(comments__status='LIVE'), distinct=True),
            vote_count=Count('votes', distinct=True)
        ).filter(
            comment_count=0,
            vote_count__gte=1  # Has at least one vote but no discussion
        )

        for diff in no_comments_diffs:
            key = (diff.work_id, diff.screen_work_id)
            if key not in no_comments_by_comparison:
                no_comments_by_comparison[key] = {
                    'work': diff.work,
                    'screen_work': diff.screen_work,
                    'no_comment_count': 0,
                    'total_votes': 0,
                }
            no_comments_by_comparison[key]['no_comment_count'] += 1
            no_comments_by_comparison[key]['total_votes'] += diff.vote_count

        # Sort by number of no-comment diffs
        return sorted(
            no_comments_by_comparison.items(),
            key=lambda x: (x[1]['no_comment_count'], x[1]['total_votes']),
            reverse=True
        )[:limit]

    @staticmethod
    def get_needs_help(limit: int = 20) -> Dict[str, Any]:
        """
        Get comparisons that need community help (grouped by comparison, not individual diffs).

        Returns:
            dict with sections:
            - needs_differences: Comparisons with <3 diffs
            - most_disputed: Comparisons with controversial diffs that need discussion
            - no_comments: Comparisons with diffs that have votes but no comments yet

        Each item includes counts of how many diffs need help.
        """
        from works.models import Work
        from screen.models import ScreenWork

        # Get data from helper methods
        needs_diffs_comparisons = DiffService._get_comparisons_needing_diffs(limit * 2)  # Get extra for filtering
        most_disputed_comparisons = DiffService._get_disputed_comparisons(limit)
        no_comments_comparisons = DiffService._get_uncommented_comparisons(limit)

        # Build needs_differences - need to bulk fetch works/screens since helper returns IDs only
        work_ids = [c['work_id'] for c in needs_diffs_comparisons[:limit]]
        screen_ids = [c['screen_work_id'] for c in needs_diffs_comparisons[:limit]]
        works_dict, screens_dict = DiffService._bulk_fetch_works_and_screens(work_ids, screen_ids)

        needs_differences = []
        for comparison in needs_diffs_comparisons[:limit]:
            work = works_dict.get(comparison['work_id'])
            screen = screens_dict.get(comparison['screen_work_id'])
            if work and screen:
                needs_differences.append(DiffService._build_comparison_dict(
                    work=work,
                    screen_work=screen,
                    diff_count=comparison['total_diffs'],
                ))

        # Build most_disputed - helper already has work/screen objects via select_related
        most_disputed = []
        for (work_id, screen_id), data in most_disputed_comparisons:
            most_disputed.append(DiffService._build_comparison_dict(
                work=data['work'],
                screen_work=data['screen_work'],
                disputed_diff_count=data['disputed_count'],
                total_votes=data['total_votes'],
            ))

        # Build no_comments - helper already has work/screen objects via select_related
        no_comments = []
        for (work_id, screen_id), data in no_comments_comparisons:
            no_comments.append(DiffService._build_comparison_dict(
                work=data['work'],
                screen_work=data['screen_work'],
                no_comment_diff_count=data['no_comment_count'],
                total_votes=data['total_votes'],
            ))

        return {
            'needs_differences': needs_differences,
            'most_disputed': most_disputed,
            'no_comments': no_comments,
        }

    @staticmethod
    def get_all_comparisons(limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get all available book-to-screen comparisons from AdaptationEdge.

        Returns comparisons sorted by TMDb popularity, showing diff count for each.
        """
        from works.models import Work
        from screen.models import ScreenWork, AdaptationEdge

        # Get all adaptation edges with related data
        edges = AdaptationEdge.objects.select_related(
            'work', 'screen_work'
        ).order_by('-screen_work__tmdb_popularity', 'work__title')[:limit]

        # Get diff counts for all comparisons
        diff_counts = {}
        diff_data = DiffItem.objects.filter(
            status='LIVE'
        ).values('work_id', 'screen_work_id').annotate(
            total_diffs=Count('id', distinct=True)
        )

        for item in diff_data:
            key = (item['work_id'], item['screen_work_id'])
            diff_counts[key] = item['total_diffs']

        # Get comparison vote counts
        work_ids = [edge.work.id for edge in edges]
        screen_work_ids = [edge.screen_work.id for edge in edges]
        comparison_votes = DiffService._get_comparison_votes(work_ids, screen_work_ids)

        results = []
        for edge in edges:
            key = (edge.work.id, edge.screen_work.id)
            diff_count = diff_counts.get(key, 0)

            results.append({
                'work_id': edge.work.id,
                'work_title': edge.work.title,
                'work_slug': edge.work.slug,
                'work_author': edge.work.author,
                'work_year': edge.work.year,
                'cover_url': edge.work.cover_url,
                'screen_work_id': edge.screen_work.id,
                'screen_work_title': edge.screen_work.title,
                'screen_work_slug': edge.screen_work.slug,
                'screen_work_type': edge.screen_work.get_type_display(),
                'screen_work_year': edge.screen_work.year,
                'poster_url': edge.screen_work.poster_url,
                'diff_count': diff_count,
                'comparison_vote_count': comparison_votes.get(key, 0),
            })

        return results
