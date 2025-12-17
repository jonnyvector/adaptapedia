"""Business logic services for diffs app."""
from typing import Optional
from django.contrib.auth import get_user_model
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
