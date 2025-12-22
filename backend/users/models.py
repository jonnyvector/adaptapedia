"""User models and profiles."""
from django.db import models
from django.contrib.auth.models import AbstractUser


class UserRole(models.TextChoices):
    """User role choices."""

    USER = 'USER', 'User'
    TRUSTED_EDITOR = 'TRUSTED_EDITOR', 'Trusted Editor'
    MOD = 'MOD', 'Moderator'
    ADMIN = 'ADMIN', 'Admin'


class User(AbstractUser):
    """Extended user model."""

    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.USER)
    reputation_points = models.IntegerField(default=0)
    spoiler_preference = models.CharField(max_length=15, default='NONE')

    class Meta:
        """Meta options for User model."""

        db_table = 'auth_user'

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
