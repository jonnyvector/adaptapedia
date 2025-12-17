"""Serializers for diffs app."""
from rest_framework import serializers
from .models import DiffItem, DiffVote, DiffComment


class DiffItemSerializer(serializers.ModelSerializer):
    """Serializer for DiffItem model."""

    vote_counts = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        """Meta options for DiffItemSerializer."""

        model = DiffItem
        fields = [
            'id',
            'work',
            'screen_work',
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
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'status']


class DiffVoteSerializer(serializers.ModelSerializer):
    """Serializer for DiffVote model."""

    class Meta:
        """Meta options for DiffVoteSerializer."""

        model = DiffVote
        fields = [
            'id',
            'diff_item',
            'user',
            'vote',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']


class DiffCommentSerializer(serializers.ModelSerializer):
    """Serializer for DiffComment model."""

    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        """Meta options for DiffCommentSerializer."""

        model = DiffComment
        fields = [
            'id',
            'diff_item',
            'user',
            'username',
            'body',
            'spoiler_scope',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'status']
