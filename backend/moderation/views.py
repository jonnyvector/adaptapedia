"""Views for moderation app."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Report
from .serializers import (
    ReportSerializer,
    DiffModerationSerializer,
    CommentModerationSerializer,
    ModerationActionSerializer,
)
from diffs.models import DiffItem, DiffComment


class IsModerator(permissions.BasePermission):
    """Permission class for moderators."""

    def has_permission(self, request, view):
        """Check if user is a moderator or admin."""
        return request.user and request.user.is_authenticated and (
            request.user.role in ['MOD', 'ADMIN'] or request.user.is_staff
        )


class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet for Report model."""

    queryset = Report.objects.select_related('created_by', 'resolved_by').all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'reason', 'target_type']

    def get_queryset(self):
        """Filter queryset based on user role."""
        if self.request.user.role in ['MOD', 'ADMIN'] or self.request.user.is_staff:
            return super().get_queryset()
        # Regular users can only see their own reports
        return Report.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def resolve(self, request, pk=None):
        """Resolve a report."""
        report = self.get_object()
        report.status = 'RESOLVED'
        report.resolved_at = timezone.now()
        report.resolved_by = request.user
        report.save()
        serializer = self.get_serializer(report)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def dismiss(self, request, pk=None):
        """Dismiss a report."""
        report = self.get_object()
        report.status = 'DISMISSED'
        report.resolved_at = timezone.now()
        report.resolved_by = request.user
        report.save()
        serializer = self.get_serializer(report)
        return Response(serializer.data)


class DiffModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for moderating DiffItem."""

    serializer_class = DiffModerationSerializer
    permission_classes = [IsModerator]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'category', 'spoiler_scope']

    def get_queryset(self):
        """Get diffs that need moderation."""
        return DiffItem.objects.select_related(
            'work', 'screen_work', 'created_by'
        ).filter(
            status__in=['PENDING', 'FLAGGED']
        ).order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def approve(self, request, pk=None):
        """Approve a diff item."""
        diff_item = self.get_object()
        diff_item.status = 'LIVE'
        diff_item.save()
        serializer = self.get_serializer(diff_item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def reject(self, request, pk=None):
        """Reject a diff item."""
        diff_item = self.get_object()
        action_serializer = ModerationActionSerializer(data=request.data)
        action_serializer.is_valid(raise_exception=True)

        diff_item.status = 'REJECTED'
        diff_item.save()

        # TODO: Store rejection reason in a separate model if needed
        serializer = self.get_serializer(diff_item)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def flag(self, request, pk=None):
        """Flag a diff item for review."""
        diff_item = self.get_object()
        diff_item.status = 'FLAGGED'
        diff_item.save()
        serializer = self.get_serializer(diff_item)
        return Response(serializer.data)


class CommentModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for moderating DiffComment."""

    serializer_class = CommentModerationSerializer
    permission_classes = [IsModerator]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'spoiler_scope']

    def get_queryset(self):
        """Get comments that need moderation."""
        return DiffComment.objects.select_related(
            'diff_item__work', 'diff_item__screen_work', 'user'
        ).filter(
            status__in=['PENDING', 'LIVE']
        ).order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def approve(self, request, pk=None):
        """Approve a comment."""
        comment = self.get_object()
        comment.status = 'LIVE'
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def hide(self, request, pk=None):
        """Hide a comment."""
        comment = self.get_object()
        comment.status = 'HIDDEN'
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsModerator])
    def delete(self, request, pk=None):
        """Delete a comment."""
        comment = self.get_object()
        comment.status = 'DELETED'
        comment.save()
        serializer = self.get_serializer(comment)
        return Response(serializer.data)
