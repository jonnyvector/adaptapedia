"""Serializers for screen app."""
from rest_framework import serializers
from .models import ScreenWork, AdaptationEdge


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
            'poster_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class AdaptationEdgeSerializer(serializers.ModelSerializer):
    """Serializer for AdaptationEdge model."""

    class Meta:
        """Meta options for AdaptationEdgeSerializer."""

        model = AdaptationEdge
        fields = [
            'id',
            'work',
            'screen_work',
            'relation_type',
            'source',
            'confidence',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
