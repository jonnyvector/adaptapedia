"""Serializers for users app."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count, Q
from .models import User, Bookmark


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


class BookmarkSerializer(serializers.ModelSerializer):
    """Serializer for Bookmark model."""

    work_title = serializers.CharField(source='work.title', read_only=True)
    work_slug = serializers.CharField(source='work.slug', read_only=True)
    work_author = serializers.CharField(source='work.author', read_only=True)
    work_cover_url = serializers.CharField(source='work.cover_url', read_only=True)
    screen_work_title = serializers.CharField(source='screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='screen_work.slug', read_only=True)
    screen_work_type = serializers.CharField(source='screen_work.type', read_only=True)
    screen_work_poster_url = serializers.CharField(source='screen_work.poster_url', read_only=True)

    class Meta:
        """Meta options for BookmarkSerializer."""

        model = Bookmark
        fields = [
            'id',
            'user',
            'work',
            'screen_work',
            'work_title',
            'work_slug',
            'work_author',
            'work_cover_url',
            'screen_work_title',
            'screen_work_slug',
            'screen_work_type',
            'screen_work_poster_url',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, attrs: dict) -> dict:
        """Validate that the work and screen work have an adaptation relationship."""
        from screen.models import AdaptationEdge

        work = attrs.get('work')
        screen_work = attrs.get('screen_work')

        # Check if adaptation edge exists
        if not AdaptationEdge.objects.filter(work=work, screen_work=screen_work).exists():
            raise serializers.ValidationError(
                "No adaptation relationship exists between this book and screen work."
            )

        # Check for duplicate bookmark (only during creation)
        if not self.instance:
            # Get user from context (will be set by perform_create)
            user = self.context['request'].user if 'request' in self.context else None
            if user and Bookmark.objects.filter(user=user, work=work, screen_work=screen_work).exists():
                raise serializers.ValidationError(
                    "You have already bookmarked this comparison."
                )

        return attrs
