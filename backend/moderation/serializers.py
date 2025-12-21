"""Serializers for moderation app."""
from rest_framework import serializers
from .models import Report
from diffs.models import DiffItem, DiffComment


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


class DiffModerationSerializer(serializers.ModelSerializer):
    """Serializer for moderating DiffItem."""

    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    work_title = serializers.CharField(source='work.title', read_only=True)
    work_slug = serializers.CharField(source='work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='screen_work.slug', read_only=True)
    vote_counts = serializers.ReadOnlyField()

    class Meta:
        """Meta options for DiffModerationSerializer."""

        model = DiffItem
        fields = [
            'id',
            'work',
            'screen_work',
            'work_title',
            'work_slug',
            'screen_work_title',
            'screen_work_slug',
            'category',
            'claim',
            'detail',
            'spoiler_scope',
            'status',
            'created_by',
            'created_by_username',
            'vote_counts',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class CommentModerationSerializer(serializers.ModelSerializer):
    """Serializer for moderating DiffComment."""

    username = serializers.CharField(source='user.username', read_only=True)
    diff_item_claim = serializers.CharField(source='diff_item.claim', read_only=True)
    diff_item_id = serializers.IntegerField(source='diff_item.id', read_only=True)
    work_title = serializers.CharField(source='diff_item.work.title', read_only=True)
    work_slug = serializers.CharField(source='diff_item.work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='diff_item.screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='diff_item.screen_work.slug', read_only=True)

    class Meta:
        """Meta options for CommentModerationSerializer."""

        model = DiffComment
        fields = [
            'id',
            'diff_item',
            'diff_item_id',
            'diff_item_claim',
            'work_title',
            'work_slug',
            'screen_work_title',
            'screen_work_slug',
            'user',
            'username',
            'body',
            'spoiler_scope',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']


class ModerationActionSerializer(serializers.Serializer):
    """Serializer for moderation actions that require a reason."""

    reason = serializers.CharField(required=False, allow_blank=True, max_length=500)
