"""Business logic services for users app - reputation, badges, and notifications."""
from typing import Optional, List, Dict, Any
from django.db import transaction
from django.db.models import Count, Q, Avg, F
from django.utils import timezone
from ..models import (
    User, UserBadge, ReputationEvent, Notification,
    BadgeType, ReputationEventType, NotificationType
)


class ReputationService:
    """Service for managing user reputation."""

    # Reputation amounts for different events
    REP_AMOUNTS = {
        # Diff events
        ReputationEventType.DIFF_CREATED: 0,  # No rep for just creating
        ReputationEventType.DIFF_CONSENSUS_HIGH: 10,  # >75% accurate
        ReputationEventType.DIFF_CONSENSUS_MODERATE: 5,  # 50-75% accurate
        ReputationEventType.DIFF_REJECTED: -2,  # Community rejected
        ReputationEventType.DIFF_SOURCE_ADDED: 2,  # Added source

        # Comment events
        ReputationEventType.COMMENT_CREATED: 0,  # No rep for just commenting
        ReputationEventType.COMMENT_HELPFUL: 3,  # Comment marked helpful

        # Vote events
        ReputationEventType.VOTE_CAST: 0,  # No rep for voting

        # Moderation events
        ReputationEventType.CONTRIBUTION_REPORTED: 0,
        ReputationEventType.CONTRIBUTION_REMOVED: -10,
    }

    @staticmethod
    @transaction.atomic
    def award_reputation(
        user: User,
        event_type: ReputationEventType,
        description: str = "",
        diff_item=None,
        comment=None,
        vote=None
    ) -> Optional[ReputationEvent]:
        """
        Award reputation to a user for an event.

        Returns the ReputationEvent created, or None if no rep was awarded.
        """
        amount = ReputationService.REP_AMOUNTS.get(event_type, 0)

        if amount == 0:
            return None

        # Create reputation event
        event = ReputationEvent.objects.create(
            user=user,
            event_type=event_type,
            amount=amount,
            description=description,
            diff_item=diff_item,
            comment=comment,
            vote=vote
        )

        # Update user's reputation
        user.reputation_points = F('reputation_points') + amount
        user.save(update_fields=['reputation_points'])
        user.refresh_from_db()

        # Check for reputation milestones and create notification
        milestones = [10, 50, 100, 250, 500, 1000, 2500, 5000]
        if user.reputation_points in milestones:
            NotificationService.create_notification(
                user=user,
                notification_type=NotificationType.REPUTATION_MILESTONE,
                title=f"Reputation Milestone: {user.reputation_points}",
                message=f"Congratulations! You've reached {user.reputation_points} reputation points.",
                metadata={'reputation': user.reputation_points}
            )

        return event

    @staticmethod
    def calculate_diff_consensus_rep(diff_item: Any) -> Optional[ReputationEventType]:
        """
        Calculate reputation award based on diff voting consensus.

        Args:
            diff_item: DiffItem instance with vote counts annotated

        Returns:
            ReputationEventType for the consensus level, or None if below threshold

        Call this when a diff reaches voting threshold (e.g., 10+ votes).
        """
        total_votes = diff_item.total_votes

        # Need minimum votes for consensus
        if total_votes < 10:
            return None

        accurate_ratio = diff_item.accurate_count / total_votes if total_votes > 0 else 0

        if accurate_ratio >= 0.75:
            return ReputationEventType.DIFF_CONSENSUS_HIGH
        elif accurate_ratio >= 0.5:
            return ReputationEventType.DIFF_CONSENSUS_MODERATE
        elif diff_item.disagree_count > diff_item.accurate_count:
            return ReputationEventType.DIFF_REJECTED

        return None

    @staticmethod
    def get_user_stats(user: User) -> Dict[str, Any]:
        """Get comprehensive reputation stats for a user."""
        from diffs.models import DiffItem, DiffVote, DiffComment, ComparisonVote

        # Count contributions (including both diff votes and comparison votes)
        total_diffs = DiffItem.objects.filter(created_by=user, status='LIVE').count()
        diff_votes = DiffVote.objects.filter(user=user).count()
        comparison_votes = ComparisonVote.objects.filter(user=user).count()
        total_votes = diff_votes + comparison_votes
        total_comments = DiffComment.objects.filter(user=user, status='LIVE').count()

        # Calculate accuracy rate
        diffs_with_votes = DiffItem.objects.filter(
            created_by=user,
            status='LIVE'
        ).annotate(
            total_votes_count=Count('votes'),
            accurate_votes=Count('votes', filter=Q(votes__vote='ACCURATE')),
        ).filter(total_votes_count__gte=5)  # Only count diffs with 5+ votes

        accuracy_stats = diffs_with_votes.aggregate(
            avg_accuracy=Avg(
                F('accurate_votes') * 100.0 / F('total_votes_count')
            )
        )

        accuracy_rate = round(accuracy_stats['avg_accuracy'], 1) if accuracy_stats['avg_accuracy'] else None

        # Get recent reputation events
        recent_events = ReputationEvent.objects.filter(user=user).select_related(
            'diff_item', 'comment'
        )[:10]

        return {
            'reputation': user.reputation_points,
            'total_diffs': total_diffs,
            'total_votes': total_votes,
            'total_comments': total_comments,
            'accuracy_rate': accuracy_rate,
            'diffs_evaluated': diffs_with_votes.count(),
            'recent_events': recent_events,
        }


class BadgeService:
    """Service for managing user badges."""

    # Badge definitions with thresholds
    BADGE_THRESHOLDS = {
        # Milestone badges
        BadgeType.VOTER_10: {'votes': 10},
        BadgeType.VOTER_50: {'votes': 50},
        BadgeType.VOTER_100: {'votes': 100},
        BadgeType.COMMENTER_10: {'comments': 10},
        BadgeType.COMMENTER_50: {'comments': 50},
        BadgeType.DIFF_CREATOR_5: {'diffs': 5},
        BadgeType.DIFF_CREATOR_25: {'diffs': 25},

        # Quality badges
        BadgeType.WELL_SOURCED: {'sourced_diffs': 5},
        BadgeType.HIGH_ACCURACY: {'diffs_with_high_accuracy': 5, 'min_accuracy': 0.75},
        BadgeType.HELPFUL_COMMENTER: {'helpful_comments': 10},

        # Community badges
        BadgeType.EARLY_ADOPTER: {'joined_before': '2025-02-01'},
    }

    @staticmethod
    @transaction.atomic
    def award_badge(
        user: User,
        badge_type: BadgeType,
        metadata: Optional[Dict] = None
    ) -> Optional[UserBadge]:
        """
        Award a badge to a user.

        Returns the UserBadge if created (new badge), or None if already earned.
        """
        # Check if user already has this badge
        existing = UserBadge.objects.filter(user=user, badge_type=badge_type).first()
        if existing:
            return None

        # Create the badge
        badge = UserBadge.objects.create(
            user=user,
            badge_type=badge_type,
            metadata=metadata or {}
        )

        # Create notification
        NotificationService.create_notification(
            user=user,
            notification_type=NotificationType.BADGE_EARNED,
            title=f"Badge Earned: {badge.get_badge_type_display()}",
            message=f"You've earned the {badge.get_badge_type_display()} badge!",
            badge=badge,
            action_url=f"/u/{user.username}"
        )

        return badge

    @staticmethod
    def check_milestone_badges(user: User) -> List[UserBadge]:
        """
        Check and award all applicable milestone badges for a user.

        Returns list of newly awarded badges.
        """
        from diffs.models import DiffItem, DiffVote, DiffComment

        awarded_badges = []

        # Count user's contributions
        vote_count = DiffVote.objects.filter(user=user).count()
        comment_count = DiffComment.objects.filter(user=user, status='LIVE').count()
        diff_count = DiffItem.objects.filter(created_by=user, status='LIVE').count()

        # Check vote badges
        if vote_count == 1:
            badge = BadgeService.award_badge(user, BadgeType.FIRST_VOTE)
            if badge:
                awarded_badges.append(badge)
        elif vote_count >= 100:
            badge = BadgeService.award_badge(user, BadgeType.VOTER_100)
            if badge:
                awarded_badges.append(badge)
        elif vote_count >= 50:
            badge = BadgeService.award_badge(user, BadgeType.VOTER_50)
            if badge:
                awarded_badges.append(badge)
        elif vote_count >= 10:
            badge = BadgeService.award_badge(user, BadgeType.VOTER_10)
            if badge:
                awarded_badges.append(badge)

        # Check comment badges
        if comment_count == 1:
            badge = BadgeService.award_badge(user, BadgeType.FIRST_COMMENT)
            if badge:
                awarded_badges.append(badge)
        elif comment_count >= 50:
            badge = BadgeService.award_badge(user, BadgeType.COMMENTER_50)
            if badge:
                awarded_badges.append(badge)
        elif comment_count >= 10:
            badge = BadgeService.award_badge(user, BadgeType.COMMENTER_10)
            if badge:
                awarded_badges.append(badge)

        # Check diff creation badges
        if diff_count == 1:
            badge = BadgeService.award_badge(user, BadgeType.FIRST_DIFF)
            if badge:
                awarded_badges.append(badge)
        elif diff_count >= 25:
            badge = BadgeService.award_badge(user, BadgeType.DIFF_CREATOR_25)
            if badge:
                awarded_badges.append(badge)
        elif diff_count >= 5:
            badge = BadgeService.award_badge(user, BadgeType.DIFF_CREATOR_5)
            if badge:
                awarded_badges.append(badge)

        return awarded_badges

    @staticmethod
    def check_quality_badges(user: User) -> List[UserBadge]:
        """
        Check and award quality badges based on contribution quality.

        Returns list of newly awarded badges.
        """
        from diffs.models import DiffItem

        awarded_badges = []

        # High Accuracy badge: 5+ diffs with >75% accurate votes
        diffs_with_votes = DiffItem.objects.filter(
            created_by=user,
            status='LIVE'
        ).annotate(
            total_votes_count=Count('votes'),
            accurate_votes=Count('votes', filter=Q(votes__vote='ACCURATE')),
        ).filter(total_votes_count__gte=5)

        high_accuracy_diffs = diffs_with_votes.filter(
            accurate_votes__gte=F('total_votes_count') * 0.75
        ).count()

        if high_accuracy_diffs >= 5:
            badge = BadgeService.award_badge(
                user,
                BadgeType.HIGH_ACCURACY,
                metadata={'high_accuracy_count': high_accuracy_diffs}
            )
            if badge:
                awarded_badges.append(badge)

        # Well-Sourced badge: Added sources to 5+ diffs
        # TODO: Track when sources are added (need to add source field to DiffItem)

        return awarded_badges


class NotificationService:
    """Service for managing user notifications."""

    @staticmethod
    def create_notification(
        user: User,
        notification_type: NotificationType,
        title: str,
        message: str,
        action_url: str = "",
        badge: Optional[UserBadge] = None,
        diff_item=None,
        comment=None,
        metadata: Optional[Dict] = None
    ) -> Notification:
        """Create a notification for a user."""
        return Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            action_url=action_url,
            badge=badge,
            diff_item=diff_item,
            comment=comment,
            metadata=metadata or {}
        )

    @staticmethod
    def mark_as_read(notification_id: int) -> bool:
        """Mark a notification as read."""
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
            return True
        except Notification.DoesNotExist:
            return False

    @staticmethod
    def mark_all_read(user: User) -> int:
        """Mark all notifications for a user as read. Returns count of notifications marked."""
        count = Notification.objects.filter(user=user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return count

    @staticmethod
    def get_unread_count(user: User) -> int:
        """Get count of unread notifications for a user."""
        return Notification.objects.filter(user=user, is_read=False).count()

    @staticmethod
    def notify_diff_consensus(diff_item, creator: User) -> None:
        """Create notification when a diff reaches consensus."""
        total_votes = diff_item.total_votes
        accurate_ratio = diff_item.accurate_count / total_votes if total_votes > 0 else 0
        percentage = round(accurate_ratio * 100)

        NotificationService.create_notification(
            user=creator,
            notification_type=NotificationType.DIFF_CONSENSUS,
            title="Your difference reached consensus",
            message=f"{percentage}% of voters marked your difference as accurate: \"{diff_item.claim}\"",
            action_url=f"/compare/{diff_item.work.slug}/{diff_item.screen_work.slug}",
            diff_item=diff_item,
            metadata={'percentage': percentage, 'total_votes': total_votes}
        )

    @staticmethod
    def notify_comment_reply(comment, parent_comment) -> None:
        """Create notification when someone replies to a comment."""
        NotificationService.create_notification(
            user=parent_comment.user,
            notification_type=NotificationType.COMMENT_REPLY,
            title=f"{comment.user.username} replied to your comment",
            message=comment.body[:200],  # Truncate long comments
            action_url=f"/compare/{comment.diff_item.work.slug}/{comment.diff_item.screen_work.slug}",
            comment=comment,
            diff_item=comment.diff_item
        )
