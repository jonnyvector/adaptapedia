"""Serializers for diffs app."""
from rest_framework import serializers
from .models import DiffItem, DiffVote, DiffComment, ComparisonVote


class DiffItemSerializer(serializers.ModelSerializer):
    """Serializer for DiffItem model."""

    vote_counts = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    work_title = serializers.CharField(source='work.title', read_only=True)
    work_slug = serializers.CharField(source='work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='screen_work.slug', read_only=True)
    cover_url = serializers.CharField(source='work.cover_url', read_only=True)
    poster_url = serializers.CharField(source='screen_work.poster_url', read_only=True)
    user_vote = serializers.SerializerMethodField()

    class Meta:
        """Meta options for DiffItemSerializer."""

        model = DiffItem
        fields = [
            'id',
            'work',
            'screen_work',
            'work_title',
            'work_slug',
            'screen_work_title',
            'screen_work_slug',
            'cover_url',
            'poster_url',
            'category',
            'claim',
            'detail',
            'spoiler_scope',
            'status',
            'image',
            'created_by',
            'created_by_username',
            'vote_counts',
            'user_vote',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'status']

    def get_user_vote(self, obj):
        """Get the current user's vote on this diff, if any."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = DiffVote.objects.filter(diff_item=obj, user=request.user).first()
            if vote:
                return vote.vote
        return None

    def validate_claim(self, value: str) -> str:
        """Validate claim field."""
        if len(value) < 10:
            raise serializers.ValidationError('Claim must be at least 10 characters long.')
        if len(value) > 200:
            raise serializers.ValidationError('Claim must not exceed 200 characters.')
        return value

    def validate_detail(self, value: str) -> str:
        """Validate detail field."""
        if len(value) > 1000:
            raise serializers.ValidationError('Detail must not exceed 1000 characters.')
        return value

    def validate_image(self, value):
        """Validate uploaded image."""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError('Image size must be less than 5MB.')

            # Check file type
            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError('Only JPEG, PNG, and WebP images are allowed.')

        return value


class DiffVoteSerializer(serializers.ModelSerializer):
    """Serializer for DiffVote model."""

    diff_item_claim = serializers.CharField(source='diff_item.claim', read_only=True)
    diff_item_category = serializers.CharField(source='diff_item.category', read_only=True)
    work_title = serializers.CharField(source='diff_item.work.title', read_only=True)
    work_slug = serializers.CharField(source='diff_item.work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='diff_item.screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='diff_item.screen_work.slug', read_only=True)
    created_by_username = serializers.CharField(source='diff_item.created_by.username', read_only=True)

    class Meta:
        """Meta options for DiffVoteSerializer."""

        model = DiffVote
        fields = [
            'id',
            'diff_item',
            'user',
            'vote',
            'created_at',
            'diff_item_claim',
            'diff_item_category',
            'work_title',
            'work_slug',
            'screen_work_title',
            'screen_work_slug',
            'created_by_username',
        ]
        read_only_fields = ['id', 'user', 'created_at']


class DiffCommentSerializer(serializers.ModelSerializer):
    """Serializer for DiffComment model."""

    username = serializers.CharField(source='user.username', read_only=True)
    diff_item_claim = serializers.CharField(source='diff_item.claim', read_only=True)
    work_title = serializers.CharField(source='diff_item.work.title', read_only=True)
    work_slug = serializers.CharField(source='diff_item.work.slug', read_only=True)
    screen_work_title = serializers.CharField(source='diff_item.screen_work.title', read_only=True)
    screen_work_slug = serializers.CharField(source='diff_item.screen_work.slug', read_only=True)
    top_badge = serializers.SerializerMethodField()

    def get_top_badge(self, obj):
        """Get the user's most prestigious badge to display next to their name."""
        from users.models import UserBadge, BadgeType

        # Badge priority order (higher = more prestigious)
        badge_priority = {
            # Quality badges (highest priority)
            BadgeType.HIGH_ACCURACY: 100,
            BadgeType.WELL_SOURCED: 99,
            BadgeType.CONSENSUS_BUILDER: 98,
            # High milestone badges
            BadgeType.VOTER_100: 49,
            # Medium milestone badges
            BadgeType.VOTER_50: 29,
            BadgeType.COMMENTER_50: 28,
            BadgeType.DIFF_CREATOR_25: 27,
            # Low milestone badges
            BadgeType.VOTER_10: 14,
            BadgeType.COMMENTER_10: 13,
            BadgeType.DIFF_CREATOR_5: 12,
            # Special badges
            BadgeType.EARLY_ADOPTER: 80,
            BadgeType.WEEKLY_CONTRIBUTOR: 35,
            # First badges (lowest priority)
            BadgeType.FIRST_DIFF: 5,
            BadgeType.FIRST_VOTE: 4,
            BadgeType.FIRST_COMMENT: 3,
        }

        badges = UserBadge.objects.filter(user=obj.user).select_related('user')
        if not badges.exists():
            return None

        # Find the most prestigious badge
        top_badge = max(badges, key=lambda b: badge_priority.get(b.badge_type, 0))
        return {
            'badge_type': top_badge.badge_type,
            'badge_display': top_badge.get_badge_type_display(),
        }

    class Meta:
        """Meta options for DiffCommentSerializer."""

        model = DiffComment
        fields = [
            'id',
            'diff_item',
            'user',
            'username',
            'top_badge',
            'parent',
            'body',
            'spoiler_scope',
            'status',
            'created_at',
            'diff_item_claim',
            'work_title',
            'work_slug',
            'screen_work_title',
            'screen_work_slug',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'status']


class ComparisonVoteSerializer(serializers.ModelSerializer):
    """Serializer for ComparisonVote model."""

    class Meta:
        """Meta options for ComparisonVoteSerializer."""

        model = ComparisonVote
        fields = [
            'id',
            'work',
            'screen_work',
            'user',
            'has_read_book',
            'has_watched_adaptation',
            'preference',
            'faithfulness_rating',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, data):
        """Validate comparison vote data."""
        # Require both consumption confirmations
        if not data.get('has_read_book') or not data.get('has_watched_adaptation'):
            raise serializers.ValidationError(
                'You must confirm that you have read the book and watched the adaptation.'
            )

        # Faithfulness rating only valid if they finished both
        if data.get('preference') != 'DIDNT_FINISH' and data.get('faithfulness_rating') is not None:
            rating = data.get('faithfulness_rating')
            if rating < 1 or rating > 5:
                raise serializers.ValidationError(
                    'Faithfulness rating must be between 1 and 5.'
                )

        return data
