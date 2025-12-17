"""Admin configuration for moderation app."""
from django.contrib import admin
from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Admin interface for Report model."""

    list_display = ['target_type', 'target_id', 'reason', 'status', 'created_by', 'created_at']
    list_filter = ['status', 'reason', 'target_type', 'created_at']
    search_fields = ['detail', 'created_by__username']
    readonly_fields = ['created_at', 'resolved_at']
    raw_id_fields = ['created_by', 'resolved_by']
