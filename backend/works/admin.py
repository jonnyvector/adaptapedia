"""Admin configuration for works app."""
from django.contrib import admin
from .models import Work


@admin.register(Work)
class WorkAdmin(admin.ModelAdmin):
    """Admin interface for Work model."""

    list_display = ['title', 'year', 'wikidata_qid', 'openlibrary_work_id', 'created_at']
    list_filter = ['year', 'language', 'created_at']
    search_fields = ['title', 'wikidata_qid', 'openlibrary_work_id']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('title',)}
