"""Admin configuration for users app."""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model."""

    list_display = ['username', 'email', 'role', 'reputation_points', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_superuser', 'date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Adaptapedia', {'fields': ('role', 'reputation_points', 'spoiler_preference')}),
    )
