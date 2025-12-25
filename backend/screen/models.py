"""Models for screen works (movies/TV)."""
from django.db import models
from django.utils.text import slugify


class ScreenWorkType(models.TextChoices):
    """Choices for screen work type."""

    MOVIE = 'MOVIE', 'Movie'
    TV = 'TV', 'TV Series'


class ScreenWork(models.Model):
    """Screen work (movie/TV series) model."""

    type = models.CharField(max_length=10, choices=ScreenWorkType.choices)
    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True, db_index=True)
    summary = models.TextField(blank=True)
    year = models.IntegerField(null=True, blank=True)
    wikidata_qid = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    tmdb_id = models.IntegerField(unique=True, null=True, blank=True, db_index=True)
    tmdb_popularity = models.FloatField(default=0.0, db_index=True, help_text="TMDb popularity score for ranking")
    poster_url = models.URLField(blank=True)
    primary_genre = models.CharField(max_length=100, blank=True, db_index=True, help_text="Primary genre from TMDb (first in list)")
    genres = models.JSONField(default=list, blank=True, help_text="Full list of genres from TMDb")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for ScreenWork model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['type', 'year']),
        ]

    def __str__(self) -> str:
        """String representation of ScreenWork."""
        return f"{self.title} ({self.get_type_display()})"

    def save(self, *args, **kwargs) -> None:
        """Override save to generate slug."""
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug

            # Check for duplicates and append year if needed
            counter = 1
            while ScreenWork.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                if self.year:
                    slug = f"{base_slug}-{self.year}"
                    if not ScreenWork.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                        break
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug
        super().save(*args, **kwargs)


class AdaptationEdge(models.Model):
    """Relationship between a book work and its screen adaptation."""

    class RelationType(models.TextChoices):
        """Types of adaptation relationships."""

        BASED_ON = 'BASED_ON', 'Based On'
        INSPIRED_BY = 'INSPIRED_BY', 'Inspired By'
        LOOSELY_BASED = 'LOOSELY_BASED', 'Loosely Based On'

    class Source(models.TextChoices):
        """Source of the relationship data."""

        WIKIDATA = 'WIKIDATA', 'Wikidata'
        MANUAL = 'MANUAL', 'Manual'

    work = models.ForeignKey('works.Work', on_delete=models.CASCADE, related_name='adaptations')
    screen_work = models.ForeignKey(ScreenWork, on_delete=models.CASCADE, related_name='source_works')
    relation_type = models.CharField(max_length=20, choices=RelationType.choices, default=RelationType.BASED_ON)
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WIKIDATA)
    confidence = models.SmallIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for AdaptationEdge model."""

        unique_together = [['work', 'screen_work']]
        indexes = [
            models.Index(fields=['work', 'screen_work']),
        ]

    def __str__(self) -> str:
        """String representation of AdaptationEdge."""
        return f"{self.screen_work.title} → {self.work.title}"
