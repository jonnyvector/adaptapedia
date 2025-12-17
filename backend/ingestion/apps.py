"""App configuration for ingestion."""
from django.apps import AppConfig


class IngestionConfig(AppConfig):
    """Configuration for the ingestion app."""

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ingestion'
