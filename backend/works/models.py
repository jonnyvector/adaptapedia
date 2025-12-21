"""Models for literary works (books)."""
from django.db import models
from django.utils.text import slugify


class Work(models.Model):
    """Literary work (book) model."""

    title = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True, db_index=True)
    author = models.CharField(max_length=255, blank=True, db_index=True)
    summary = models.TextField(blank=True)
    year = models.IntegerField(null=True, blank=True)
    language = models.CharField(max_length=10, blank=True)
    genre = models.CharField(max_length=100, blank=True)
    wikidata_qid = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    openlibrary_work_id = models.CharField(max_length=50, unique=True, null=True, blank=True, db_index=True)
    cover_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for Work model."""

        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['year']),
        ]

    def __str__(self) -> str:
        """String representation of Work."""
        return self.title

    def save(self, *args, **kwargs) -> None:
        """Override save to generate slug."""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
