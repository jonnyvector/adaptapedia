"""App configuration for moderation."""
from django.apps import AppConfig


class ModerationConfig(AppConfig):
    """Configuration for the moderation app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'moderation'
