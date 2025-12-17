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
