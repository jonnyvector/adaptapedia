"""Admin configuration for diffs app."""
from django.contrib import admin
from .models import DiffItem, DiffVote, DiffComment


@admin.register(DiffItem)
class DiffItemAdmin(admin.ModelAdmin):
    """Admin interface for DiffItem model."""

    list_display = ['claim', 'category', 'work', 'screen_work', 'spoiler_scope', 'status', 'created_by', 'created_at']
    list_filter = ['category', 'spoiler_scope', 'status', 'created_at']
    search_fields = ['claim', 'detail', 'work__title', 'screen_work__title']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['work', 'screen_work', 'created_by']


@admin.register(DiffVote)
class DiffVoteAdmin(admin.ModelAdmin):
    """Admin interface for DiffVote model."""

    list_display = ['diff_item', 'user', 'vote', 'created_at']
    list_filter = ['vote', 'created_at']
    search_fields = ['diff_item__claim', 'user__username']
    readonly_fields = ['created_at']
    raw_id_fields = ['diff_item', 'user']


@admin.register(DiffComment)
class DiffCommentAdmin(admin.ModelAdmin):
    """Admin interface for DiffComment model."""

    list_display = ['diff_item', 'user', 'spoiler_scope', 'status', 'created_at']
    list_filter = ['spoiler_scope', 'status', 'created_at']
    search_fields = ['body', 'diff_item__claim', 'user__username']
    readonly_fields = ['created_at']
    raw_id_fields = ['diff_item', 'user']
