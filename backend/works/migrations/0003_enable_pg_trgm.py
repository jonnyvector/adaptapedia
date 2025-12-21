"""Enable PostgreSQL trigram extension for fuzzy search."""
from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    """Enable pg_trgm extension for fuzzy text search."""

    dependencies = [
        ('works', '0002_work_author_work_genre'),
    ]

    operations = [
        TrigramExtension(),
    ]
