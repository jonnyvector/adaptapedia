"""Views for moderation app."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Report
from .serializers import ReportSerializer


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
