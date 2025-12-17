"""Models for moderation and reports."""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TargetType(models.TextChoices):
    """Types of content that can be reported."""

    DIFF = 'DIFF', 'Diff'
    COMMENT = 'COMMENT', 'Comment'


class ReportReason(models.TextChoices):
    """Reasons for reporting content."""

    SPAM = 'SPAM', 'Spam'
    ABUSE = 'ABUSE', 'Abuse'
    COPYRIGHT = 'COPYRIGHT', 'Copyright Violation'
    INCORRECT = 'INCORRECT', 'Incorrect Information'
    SPOILER_MISLABELED = 'SPOILER_MISLABELED', 'Spoiler Mislabeled'
    OTHER = 'OTHER', 'Other'


class ReportStatus(models.TextChoices):
    """Status of a report."""

    OPEN = 'OPEN', 'Open'
    RESOLVED = 'RESOLVED', 'Resolved'
    DISMISSED = 'DISMISSED', 'Dismissed'


class Report(models.Model):
    """Report on problematic content."""

    target_type = models.CharField(max_length=10, choices=TargetType.choices)
    target_id = models.IntegerField()
    reason = models.CharField(max_length=25, choices=ReportReason.choices)
    detail = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_created')
    status = models.CharField(max_length=10, choices=ReportStatus.choices, default=ReportStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_resolved'
    )

    class Meta:
        """Meta options for Report model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['target_type', 'target_id']),
        ]

    def __str__(self) -> str:
        """String representation of Report."""
        return f"{self.get_reason_display()} on {self.get_target_type_display()} #{self.target_id}"
