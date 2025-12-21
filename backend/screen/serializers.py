"""Serializers for screen app."""
from rest_framework import serializers
from .models import ScreenWork, AdaptationEdge
from works.serializers import WorkSerializer


class ScreenWorkSerializer(serializers.ModelSerializer):
    """Serializer for ScreenWork model."""

    class Meta:
        """Meta options for ScreenWorkSerializer."""

        model = ScreenWork
        fields = [
            'id',
            'type',
            'title',
            'slug',
            'summary',
            'year',
            'wikidata_qid',
            'tmdb_id',
            'tmdb_popularity',
            'poster_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class RankedAdaptationSerializer(serializers.ModelSerializer):
    """Serializer for screen works with ranking metadata."""

    engagement_score = serializers.FloatField(read_only=True)
    rank_score = serializers.FloatField(read_only=True)
    diff_count = serializers.IntegerField(read_only=True)
    last_diff_updated = serializers.DateTimeField(read_only=True)

    class Meta:
        """Meta options for RankedAdaptationSerializer."""

        model = ScreenWork
        fields = [
            'id',
            'type',
            'title',
            'slug',
            'summary',
            'year',
            'wikidata_qid',
            'tmdb_id',
            'tmdb_popularity',
            'poster_url',
            'engagement_score',
            'rank_score',
            'diff_count',
            'last_diff_updated',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'engagement_score', 'rank_score', 'diff_count', 'last_diff_updated']


class AdaptationEdgeSerializer(serializers.ModelSerializer):
    """Serializer for AdaptationEdge model."""

    work_detail = WorkSerializer(source='work', read_only=True)
    screen_work_detail = ScreenWorkSerializer(source='screen_work', read_only=True)

    class Meta:
        """Meta options for AdaptationEdgeSerializer."""

        model = AdaptationEdge
        fields = [
            'id',
            'work',
            'screen_work',
            'work_detail',
            'screen_work_detail',
            'relation_type',
            'source',
            'confidence',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
