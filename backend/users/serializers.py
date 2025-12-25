"""Serializers for users app."""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db.models import Count, Q
from .models import User, Bookmark, UserBadge, ReputationEvent, Notification


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    permissions = serializers.SerializerMethodField()

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
            'permissions',
        ]
        read_only_fields = ['id', 'role', 'reputation_points', 'date_joined']

    def get_permissions(self, obj: User):
        """Calculate unlocked permissions based on reputation."""
        rep = obj.reputation_points
        is_mod = obj.role in ['MOD', 'ADMIN'] or obj.is_staff

        return {
            'can_edit_diffs': is_mod or rep >= 50,
            'can_merge_diffs': is_mod or rep >= 100,
            'can_moderate': is_mod or rep >= 500,
            'next_unlock': self._get_next_unlock(rep, is_mod),
        }

    def _get_next_unlock(self, rep: int, is_mod: bool):
        """Get the next permission unlock for the user."""
        if is_mod:
            return None  # Moderators have all permissions

        if rep < 50:
            return {'level': 50, 'permission': 'Edit diffs', 'points_needed': 50 - rep}
        elif rep < 100:
            return {'level': 100, 'permission': 'Merge duplicate diffs', 'points_needed': 100 - rep}
        elif rep < 500:
            return {'level': 500, 'permission': 'Moderate content', 'points_needed': 500 - rep}
        return None  # All permissions unlocked


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model."""

    badge_display = serializers.CharField(source='get_badge_type_display', read_only=True)

    class Meta:
        """Meta options for UserBadgeSerializer."""

        model = UserBadge
        fields = ['id', 'badge_type', 'badge_display', 'earned_at', 'metadata']
        read_only_fields = ['id', 'earned_at']


class ReputationEventSerializer(serializers.ModelSerializer):
    """Serializer for ReputationEvent model."""

    event_type_display = serializers.CharField(source='get_event_type_display', read_only=True)
    diff_title = serializers.CharField(source='diff_item.claim', read_only=True, allow_null=True)

    class Meta:
        """Meta options for ReputationEventSerializer."""

        model = ReputationEvent
        fields = [
            'id', 'event_type', 'event_type_display', 'amount',
            'description', 'diff_title', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""

    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )

    class Meta:
        """Meta options for NotificationSerializer."""

        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'title', 'message', 'is_read', 'action_url',
            'metadata', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for User profile with activity stats, badges, and reputation."""

    badges = UserBadgeSerializer(many=True, read_only=True)
    recent_reputation_events = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()

    class Meta:
        """Meta options for UserProfileSerializer."""

        model = User
        fields = [
            'id',
            'username',
            'date_joined',
            'role',
            'reputation_points',
            'badges',
            'stats',
            'recent_reputation_events',
        ]
        read_only_fields = fields

    def get_recent_reputation_events(self, obj: User):
        """Get recent reputation events."""
        events = obj.reputation_events.all()[:10]
        return ReputationEventSerializer(events, many=True).data

    def get_stats(self, obj: User):
        """Get comprehensive user statistics."""
        from users.services import ReputationService
        return ReputationService.get_user_stats(obj)


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
