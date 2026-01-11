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
            'author',
            'summary',
            'year',
            'language',
            'genre',
            'genres',
            'wikidata_qid',
            'openlibrary_work_id',
            'cover_url',
            'average_rating',
            'ratings_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class WorkWithAdaptationsSerializer(serializers.ModelSerializer):
    """Serializer for Work with nested adaptations list."""

    adaptations = serializers.SerializerMethodField()

    class Meta:
        """Meta options for WorkWithAdaptationsSerializer."""

        model = Work
        fields = [
            'id',
            'title',
            'slug',
            'author',
            'summary',
            'year',
            'language',
            'genre',
            'genres',
            'wikidata_qid',
            'openlibrary_work_id',
            'cover_url',
            'adaptations',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'adaptations']

    def get_adaptations(self, obj):
        """Get ranked adaptations for this work."""
        # Import here to avoid circular dependency
        from screen.serializers import RankedAdaptationSerializer

        # Adaptations are already annotated and prefetched by the view
        # Annotations include diff_count and last_diff_updated for this specific pairing
        if hasattr(obj, 'ranked_adaptations'):
            return RankedAdaptationSerializer(obj.ranked_adaptations, many=True).data
        return []


class SimilarBookSerializer(serializers.ModelSerializer):
    """Serializer for similar books with adaptation count."""

    adaptation_count = serializers.IntegerField(read_only=True)
    similarity_score = serializers.FloatField(read_only=True)

    class Meta:
        """Meta options for SimilarBookSerializer."""

        model = Work
        fields = [
            'id',
            'title',
            'slug',
            'author',
            'year',
            'genre',
            'genres',
            'cover_url',
            'adaptation_count',
            'similarity_score',
        ]
        read_only_fields = ['id', 'slug', 'adaptation_count', 'similarity_score']


class GenreSerializer(serializers.Serializer):
    """Serializer for genre aggregation."""

    genre = serializers.CharField()
    book_count = serializers.IntegerField()
    slug = serializers.SerializerMethodField()

    def get_slug(self, obj):
        """Generate URL-friendly slug for genre."""
        return obj['genre'].lower().replace(' ', '-')
