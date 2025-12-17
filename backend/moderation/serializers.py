"""Serializers for moderation app."""
from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """Serializer for Report model."""

    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        """Meta options for ReportSerializer."""

        model = Report
        fields = [
            'id',
            'target_type',
            'target_id',
            'reason',
            'detail',
            'created_by',
            'created_by_username',
            'status',
            'created_at',
            'resolved_at',
            'resolved_by',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'resolved_at', 'resolved_by']
