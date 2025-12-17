"""Serializers for users app."""
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    class Meta:
        """Meta options for UserSerializer."""

        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'reputation_points',
            'spoiler_preference',
            'date_joined',
        ]
        read_only_fields = ['id', 'role', 'reputation_points', 'date_joined']
