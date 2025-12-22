"""Admin configuration for users app."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Bookmark


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""

    list_display = ['username', 'email', 'role', 'reputation_points', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_superuser', 'date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Adaptapedia', {'fields': ('role', 'reputation_points', 'spoiler_preference')}),
    )


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    """Admin interface for Bookmark model."""

    list_display = ['user', 'work', 'screen_work', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'work__title', 'screen_work__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
