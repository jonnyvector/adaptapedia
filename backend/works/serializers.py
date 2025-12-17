"""Serializers for works app."""
from rest_framework import serializers
from .models import Work


class WorkSerializer(serializers.ModelSerializer):
    """Serializer for Work model."""

    class Meta:
        """Meta options for WorkSerializer."""

        model = Work
        fields = [
            'id',
            'title',
            'slug',
            'summary',
            'year',
            'language',
            'wikidata_qid',
            'openlibrary_work_id',
            'cover_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
