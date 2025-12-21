"""Serializers for users app."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count, Q
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


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for User profile with activity stats."""

    diffs_count = serializers.SerializerMethodField()
    votes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    reputation_score = serializers.SerializerMethodField()

    class Meta:
        """Meta options for UserProfileSerializer."""

        model = User
        fields = [
            'id',
            'username',
            'date_joined',
            'role',
            'diffs_count',
            'votes_count',
            'comments_count',
            'reputation_score',
        ]
        read_only_fields = fields

    def get_diffs_count(self, obj: User) -> int:
        """Get count of diffs created by user."""
        return obj.created_diffs.filter(status='LIVE').count()

    def get_votes_count(self, obj: User) -> int:
        """Get count of votes cast by user."""
        return obj.diff_votes.count()

    def get_comments_count(self, obj: User) -> int:
        """Get count of comments posted by user."""
        return obj.diff_comments.filter(status='LIVE').count()

    def get_reputation_score(self, obj: User) -> int:
        """
        Calculate reputation score based on votes received on user's diffs.

        Formula: (accurate_votes * 2) + (needs_nuance_votes * 1) - (disagree_votes * 1)
        """
        from diffs.models import DiffVote

        # Get all votes on this user's diffs
        votes = DiffVote.objects.filter(
            diff_item__created_by=obj,
            diff_item__status='LIVE'
        ).aggregate(
            accurate=Count('id', filter=Q(vote='ACCURATE')),
            needs_nuance=Count('id', filter=Q(vote='NEEDS_NUANCE')),
            disagree=Count('id', filter=Q(vote='DISAGREE'))
        )

        score = (
            (votes['accurate'] or 0) * 2 +
            (votes['needs_nuance'] or 0) * 1 -
            (votes['disagree'] or 0) * 1
        )

        return max(0, score)  # Never go below 0


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user signup."""

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)

    class Meta:
        """Meta options for SignupSerializer."""

        model = User
        fields = ['username', 'email', 'password', 'password_confirm']

    def validate_email(self, value: str) -> str:
        """Validate that email is unique."""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value: str) -> str:
        """Validate that username is unique."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs: dict) -> dict:
        """Validate that passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Password fields didn't match."
            })
        return attrs

    def create(self, validated_data: dict) -> User:
        """Create and return a new user with encrypted password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )


class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer for authenticated user details."""

    class Meta:
        """Meta options for UserDetailSerializer."""

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
