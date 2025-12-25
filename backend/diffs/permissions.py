"""Custom permissions for diff-related operations based on reputation."""

from rest_framework import permissions


class CanEditDiff(permissions.BasePermission):
    """
    Permission to edit others' diffs.
    Requires 50 reputation points.
    """

    message = "You need 50 reputation points to edit other users' diffs."

    def has_permission(self, request, view):
        """Check if user has permission to edit diffs."""
        # Allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True

        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff/moderators always have permission
        if request.user.is_staff or request.user.role in ['MOD', 'ADMIN']:
            return True

        # Check reputation requirement
        return request.user.reputation_points >= 50

    def has_object_permission(self, request, view, obj):
        """Check if user can edit this specific diff."""
        # Allow read operations
        if request.method in permissions.SAFE_METHODS:
            return True

        # Own diffs can always be edited
        if obj.created_by == request.user:
            return True

        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff/moderators always have permission
        if request.user.is_staff or request.user.role in ['MOD', 'ADMIN']:
            return True

        # Check reputation requirement for editing others' diffs
        return request.user.reputation_points >= 50


class CanMergeDiff(permissions.BasePermission):
    """
    Permission to vote on merging duplicate diffs.
    Requires 100 reputation points.
    """

    message = "You need 100 reputation points to vote on merging diffs."

    def has_permission(self, request, view):
        """Check if user has permission to vote on merge."""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff/moderators always have permission
        if request.user.is_staff or request.user.role in ['MOD', 'ADMIN']:
            return True

        # Check reputation requirement
        return request.user.reputation_points >= 100


class CanModerate(permissions.BasePermission):
    """
    Permission to moderate content (review reports, etc.).
    Requires 500 reputation points or MOD/ADMIN role.
    """

    message = "You need 500 reputation points or moderator status to perform this action."

    def has_permission(self, request, view):
        """Check if user has permission to moderate."""
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff/moderators always have permission
        if request.user.is_staff or request.user.role in ['MOD', 'ADMIN']:
            return True

        # Check reputation requirement
        return request.user.reputation_points >= 500
