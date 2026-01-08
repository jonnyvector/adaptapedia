"""User models and profiles."""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.functions import Lower
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.indexes import GinIndex


class UserRole(models.TextChoices):
    """User role choices."""

    USER = 'USER', 'User'
    TRUSTED_EDITOR = 'TRUSTED_EDITOR', 'Trusted Editor'
    MOD = 'MOD', 'Moderator'
    ADMIN = 'ADMIN', 'Admin'


class BadgeType(models.TextChoices):
    """Badge type choices."""

    # Milestone badges
    FIRST_VOTE = 'FIRST_VOTE', 'First Vote'
    FIRST_COMMENT = 'FIRST_COMMENT', 'First Comment'
    FIRST_DIFF = 'FIRST_DIFF', 'First Difference'
    VOTER_10 = 'VOTER_10', '10 Votes'
    VOTER_50 = 'VOTER_50', '50 Votes'
    VOTER_100 = 'VOTER_100', '100 Votes'
    COMMENTER_10 = 'COMMENTER_10', '10 Comments'
    COMMENTER_50 = 'COMMENTER_50', '50 Comments'
    DIFF_CREATOR_5 = 'DIFF_CREATOR_5', '5 Differences'
    DIFF_CREATOR_25 = 'DIFF_CREATOR_25', '25 Differences'

    # Quality badges
    WELL_SOURCED = 'WELL_SOURCED', 'Well-Sourced'
    HIGH_ACCURACY = 'HIGH_ACCURACY', 'High Accuracy'
    CONSENSUS_BUILDER = 'CONSENSUS_BUILDER', 'Consensus Builder'
    EDITOR = 'EDITOR', 'Editor'
    HELPFUL_COMMENTER = 'HELPFUL_COMMENTER', 'Helpful Commenter'

    # Community badges
    EARLY_ADOPTER = 'EARLY_ADOPTER', 'Early Adopter'
    GENRE_SPECIALIST_HORROR = 'GENRE_SPECIALIST_HORROR', 'Horror Specialist'
    GENRE_SPECIALIST_SCIFI = 'GENRE_SPECIALIST_SCIFI', 'Sci-Fi Specialist'
    GENRE_SPECIALIST_FANTASY = 'GENRE_SPECIALIST_FANTASY', 'Fantasy Specialist'
    SERIES_SPECIALIST = 'SERIES_SPECIALIST', 'Series Specialist'

    # Activity badges
    ACTIVE_CONTRIBUTOR = 'ACTIVE_CONTRIBUTOR', 'Active Contributor'
    WEEKLY_CONTRIBUTOR = 'WEEKLY_CONTRIBUTOR', 'Weekly Contributor'


class ReputationEventType(models.TextChoices):
    """Reputation event types."""

    # Diff-related
    DIFF_CREATED = 'DIFF_CREATED', 'Difference Created'
    DIFF_ACCURATE = 'DIFF_ACCURATE', 'Difference Marked Accurate'
    DIFF_CONSENSUS_HIGH = 'DIFF_CONSENSUS_HIGH', 'High Consensus Achieved'
    DIFF_CONSENSUS_MODERATE = 'DIFF_CONSENSUS_MODERATE', 'Moderate Consensus Achieved'
    DIFF_REJECTED = 'DIFF_REJECTED', 'Difference Rejected'
    DIFF_SOURCE_ADDED = 'DIFF_SOURCE_ADDED', 'Source Added to Difference'

    # Comment-related
    COMMENT_CREATED = 'COMMENT_CREATED', 'Comment Created'
    COMMENT_HELPFUL = 'COMMENT_HELPFUL', 'Comment Marked Helpful'

    # Vote-related
    VOTE_CAST = 'VOTE_CAST', 'Vote Cast'

    # Moderation
    CONTRIBUTION_REPORTED = 'CONTRIBUTION_REPORTED', 'Contribution Reported'
    CONTRIBUTION_REMOVED = 'CONTRIBUTION_REMOVED', 'Contribution Removed'


class NotificationType(models.TextChoices):
    """Notification types."""

    BADGE_EARNED = 'BADGE_EARNED', 'Badge Earned'
    REPUTATION_MILESTONE = 'REPUTATION_MILESTONE', 'Reputation Milestone'
    DIFF_CONSENSUS = 'DIFF_CONSENSUS', 'Difference Reached Consensus'
    COMMENT_REPLY = 'COMMENT_REPLY', 'Comment Reply'
    COMMENT_HELPFUL = 'COMMENT_HELPFUL', 'Comment Marked Helpful'
    DIFF_VALIDATED = 'DIFF_VALIDATED', 'Difference Validated'


class User(AbstractUser):
    """Extended user model."""

    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.USER)
    reputation_points = models.IntegerField(default=0)
    spoiler_preference = models.CharField(max_length=15, default='NONE')

    # Onboarding tracking
    onboarding_completed = models.BooleanField(default=False)
    onboarding_started_at = models.DateTimeField(null=True, blank=True)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    onboarding_step = models.IntegerField(
        default=0,
        choices=[
            (0, 'Not Started'),
            (1, 'Username Selection'),
            (2, 'Interest Quiz'),
            (3, 'Suggested Comparisons'),
            (4, 'Complete'),
        ]
    )

    class Meta:
        """Meta options for User model."""

        db_table = 'auth_user'
        constraints = [
            models.UniqueConstraint(
                Lower('username'),
                name='unique_lower_username',
                violation_error_message='Username already exists (case-insensitive)'
            ),
        ]
        indexes = [
            models.Index(fields=['username']),
        ]

    def __str__(self) -> str:
        """String representation of User."""
        return self.username


class Bookmark(models.Model):
    """User bookmarks for work/screen work comparisons."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    work = models.ForeignKey('works.Work', on_delete=models.CASCADE, related_name='bookmarked_by')
    screen_work = models.ForeignKey('screen.ScreenWork', on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for Bookmark model."""

        unique_together = [['user', 'work', 'screen_work']]
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self) -> str:
        """String representation of Bookmark."""
        return f"{self.user.username} bookmarked {self.work.title} / {self.screen_work.title}"


class UserBadge(models.Model):
    """Badges earned by users."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge_type = models.CharField(max_length=50, choices=BadgeType.choices)
    earned_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store extra info like count, genre, etc.

    class Meta:
        """Meta options for UserBadge model."""

        unique_together = [['user', 'badge_type']]
        ordering = ['-earned_at']
        indexes = [
            models.Index(fields=['user', '-earned_at']),
            models.Index(fields=['badge_type']),
        ]

    def __str__(self) -> str:
        """String representation of UserBadge."""
        return f"{self.user.username} earned {self.get_badge_type_display()}"


class ReputationEvent(models.Model):
    """Audit log for reputation changes."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reputation_events')
    event_type = models.CharField(max_length=50, choices=ReputationEventType.choices)
    amount = models.IntegerField()  # Can be positive or negative
    description = models.TextField(blank=True)

    # Related objects (nullable for flexibility)
    diff_item = models.ForeignKey('diffs.DiffItem', on_delete=models.SET_NULL, null=True, blank=True)
    comment = models.ForeignKey('diffs.DiffComment', on_delete=models.SET_NULL, null=True, blank=True)
    vote = models.ForeignKey('diffs.DiffVote', on_delete=models.SET_NULL, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for ReputationEvent model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self) -> str:
        """String representation of ReputationEvent."""
        return f"{self.user.username} {'+' if self.amount >= 0 else ''}{self.amount} rep: {self.get_event_type_display()}"


class Notification(models.Model):
    """User notifications."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    action_url = models.CharField(max_length=500, blank=True)  # URL to navigate to when clicked

    # Related objects (nullable for flexibility)
    badge = models.ForeignKey(UserBadge, on_delete=models.SET_NULL, null=True, blank=True)
    diff_item = models.ForeignKey('diffs.DiffItem', on_delete=models.SET_NULL, null=True, blank=True)
    comment = models.ForeignKey('diffs.DiffComment', on_delete=models.SET_NULL, null=True, blank=True)

    metadata = models.JSONField(default=dict, blank=True)  # Extra data (rep amount, etc.)

    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        """Meta options for Notification model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', '-created_at']),
            models.Index(fields=['notification_type']),
        ]

    def __str__(self) -> str:
        """String representation of Notification."""
        return f"Notification for {self.user.username}: {self.title}"


class UserPreferences(models.Model):
    """User preferences from onboarding quiz."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    genres = ArrayField(
        models.CharField(max_length=50),
        default=list,
        blank=True,
        help_text="List of genre preferences"
    )
    book_vs_screen = models.CharField(
        max_length=20,
        blank=True,
        choices=[
            ('BOOKS', 'Prefer Books'),
            ('EQUAL', 'Enjoy Both Equally'),
            ('SCREEN', 'Prefer Adaptations'),
        ]
    )
    contribution_interest = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ('ADD_DIFFS', 'Point out differences'),
            ('DISCUSS', 'Discuss with others'),
            ('EXPLORE', 'Just exploring'),
        ]
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for UserPreferences model."""

        verbose_name_plural = "User preferences"
        indexes = [
            GinIndex(fields=['genres']),
        ]

    def __str__(self) -> str:
        """String representation of UserPreferences."""
        return f"{self.user.username}'s preferences"
