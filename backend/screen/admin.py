"""Admin configuration for screen app."""
from django.contrib import admin
from .models import ScreenWork, AdaptationEdge


@admin.register(ScreenWork)
class ScreenWorkAdmin(admin.ModelAdmin):
    """Admin interface for ScreenWork model."""

    list_display = ['title', 'type', 'year', 'tmdb_id', 'wikidata_qid', 'created_at']
    list_filter = ['type', 'year', 'created_at']
    search_fields = ['title', 'wikidata_qid', 'tmdb_id']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(AdaptationEdge)
class AdaptationEdgeAdmin(admin.ModelAdmin):
    """Admin interface for AdaptationEdge model."""

    list_display = ['screen_work', 'work', 'relation_type', 'source', 'confidence', 'created_at']
    list_filter = ['relation_type', 'source', 'created_at']
    search_fields = ['work__title', 'screen_work__title']
    readonly_fields = ['created_at']
