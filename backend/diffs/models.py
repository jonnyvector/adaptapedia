"""Models for diffs between books and screen adaptations."""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class DiffCategory(models.TextChoices):
    """Categories for differences."""

    PLOT = 'PLOT', 'Plot'
    CHARACTER = 'CHARACTER', 'Character'
    ENDING = 'ENDING', 'Ending'
    SETTING = 'SETTING', 'Setting'
    THEME = 'THEME', 'Theme'
    TONE = 'TONE', 'Tone'
    TIMELINE = 'TIMELINE', 'Timeline'
    WORLDBUILDING = 'WORLDBUILDING', 'Worldbuilding'
    OTHER = 'OTHER', 'Other'


class SpoilerScope(models.TextChoices):
    """Spoiler scope levels."""

    NONE = 'NONE', 'None (safe/high-level)'
    BOOK_ONLY = 'BOOK_ONLY', 'Book Only'
    SCREEN_ONLY = 'SCREEN_ONLY', 'Screen Only'
    FULL = 'FULL', 'Full (both)'


class DiffStatus(models.TextChoices):
    """Status of a diff item."""

    LIVE = 'LIVE', 'Live'
    HIDDEN = 'HIDDEN', 'Hidden'
    LOCKED = 'LOCKED', 'Locked'
    PENDING = 'PENDING', 'Pending'
    REJECTED = 'REJECTED', 'Rejected'
    FLAGGED = 'FLAGGED', 'Flagged'


class DiffItem(models.Model):
    """A specific difference between a book and its screen adaptation."""

    work = models.ForeignKey('works.Work', on_delete=models.CASCADE, related_name='diffs')
    screen_work = models.ForeignKey('screen.ScreenWork', on_delete=models.CASCADE, related_name='diffs')
    category = models.CharField(max_length=20, choices=DiffCategory.choices)
    claim = models.CharField(max_length=200, help_text="Short description of the difference")
    detail = models.TextField(blank=True, help_text="Detailed explanation (optional)")
    spoiler_scope = models.CharField(max_length=15, choices=SpoilerScope.choices, default=SpoilerScope.NONE)
    status = models.CharField(max_length=10, choices=DiffStatus.choices, default=DiffStatus.LIVE)
    image = models.ImageField(
        upload_to='diff_images/',
        blank=True,
        null=True,
        help_text="Optional image to illustrate the difference (max 5MB)"
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_diffs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for DiffItem model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['work', 'screen_work']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['spoiler_scope']),
            models.Index(fields=['updated_at']),  # For recently_updated queries
            models.Index(fields=['created_at']),  # For ordering
            models.Index(fields=['status', 'updated_at']),  # Composite for filtered sorts
            models.Index(fields=['status', 'work', 'screen_work']),  # For comparison queries
        ]

    def __str__(self) -> str:
        """String representation of DiffItem."""
        return f"{self.get_category_display()}: {self.claim[:50]}"

    @property
    def vote_counts(self) -> dict[str, int]:
        """Get vote counts for this diff."""
        from django.db.models import Count, Q
        votes = self.votes.aggregate(
            accurate=Count('id', filter=Q(vote='ACCURATE')),
            needs_nuance=Count('id', filter=Q(vote='NEEDS_NUANCE')),
            disagree=Count('id', filter=Q(vote='DISAGREE'))
        )
        return votes


class VoteType(models.TextChoices):
    """Types of votes on diffs."""

    ACCURATE = 'ACCURATE', 'Accurate'
    NEEDS_NUANCE = 'NEEDS_NUANCE', 'Needs Nuance'
    DISAGREE = 'DISAGREE', 'Disagree'


class DiffVote(models.Model):
    """Vote on a diff item."""

    diff_item = models.ForeignKey(DiffItem, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diff_votes')
    vote = models.CharField(max_length=15, choices=VoteType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for DiffVote model."""

        unique_together = [['diff_item', 'user']]
        indexes = [
            models.Index(fields=['diff_item', 'vote']),
            models.Index(fields=['created_at']),  # For trending queries with date filters
        ]

    def __str__(self) -> str:
        """String representation of DiffVote."""
        return f"{self.user.username} → {self.get_vote_display()}"


class CommentStatus(models.TextChoices):
    """Status of a comment."""

    LIVE = 'LIVE', 'Live'
    HIDDEN = 'HIDDEN', 'Hidden'
    PENDING = 'PENDING', 'Pending'
    DELETED = 'DELETED', 'Deleted'


class DiffComment(models.Model):
    """Comment on a diff item."""

    diff_item = models.ForeignKey(DiffItem, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diff_comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    body = models.TextField()
    spoiler_scope = models.CharField(max_length=15, choices=SpoilerScope.choices, default=SpoilerScope.NONE)
    status = models.CharField(max_length=10, choices=CommentStatus.choices, default=CommentStatus.LIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for DiffComment model."""

        ordering = ['created_at']
        indexes = [
            models.Index(fields=['diff_item', 'status']),  # For filtering live comments
            models.Index(fields=['user', '-created_at']),  # For user comment history
        ]

    def __str__(self) -> str:
        """String representation of DiffComment."""
        return f"Comment by {self.user.username} on {self.diff_item}"


class PreferenceChoice(models.TextChoices):
    """Preference choices for comparison votes."""

    BOOK = 'BOOK', 'Book'
    SCREEN = 'SCREEN', 'Screen Adaptation'
    TIE = 'TIE', 'Tie / Depends'
    DIDNT_FINISH = 'DIDNT_FINISH', "Didn't finish both"


class ComparisonVote(models.Model):
    """Vote comparing a book and its screen adaptation."""

    work = models.ForeignKey('works.Work', on_delete=models.CASCADE, related_name='comparison_votes')
    screen_work = models.ForeignKey('screen.ScreenWork', on_delete=models.CASCADE, related_name='comparison_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comparison_votes')

    # Consumption confirmation
    has_read_book = models.BooleanField(default=False)
    has_watched_adaptation = models.BooleanField(default=False)

    # Two-axis voting
    preference = models.CharField(max_length=20, choices=PreferenceChoice.choices)
    faithfulness_rating = models.IntegerField(
        null=True,
        blank=True,
        help_text="How faithful is the adaptation? (1=Completely different, 5=Very faithful)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for ComparisonVote model."""

        unique_together = [['work', 'screen_work', 'user']]
        indexes = [
            models.Index(fields=['work', 'screen_work']),
            models.Index(fields=['preference']),
            models.Index(fields=['user', '-created_at']),  # For user voting history
        ]

    def __str__(self) -> str:
        """String representation of ComparisonVote."""
        return f"{self.user.username}: {self.get_preference_display()}"
