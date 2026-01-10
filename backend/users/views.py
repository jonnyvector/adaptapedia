"""Views for users app."""
from rest_framework import viewsets, permissions, decorators, response, status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models, IntegrityError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import User, Bookmark, Notification, UserPreferences
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    SignupSerializer,
    LoginSerializer,
    UserDetailSerializer,
    BookmarkSerializer,
    NotificationSerializer,
    UserPreferencesSerializer,
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for user activity lists."""

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for User model (read-only for now)."""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'username'

    def get_serializer_class(self):
        """Use UserProfileSerializer for retrieve action."""
        if self.action == 'retrieve':
            return UserProfileSerializer
        return UserSerializer

    @decorators.action(detail=True, methods=['get'], url_path='diffs')
    def diffs(self, request, username=None):
        """
        Get diffs created by a specific user.

        Query params:
        - ordering: 'newest' (default) or 'most_votes'
        - page: page number
        - page_size: items per page (max 100)
        """
        from diffs.models import DiffItem
        from diffs.serializers import DiffItemSerializer

        user = self.get_object()

        # Get user's diffs (only LIVE status)
        queryset = DiffItem.objects.filter(
            created_by=user,
            status='LIVE'
        ).select_related('work', 'screen_work', 'created_by')

        # Apply ordering
        ordering = request.query_params.get('ordering', 'newest')
        if ordering == 'most_votes':
            # Order by total accurate votes (primary indicator of quality)
            queryset = queryset.annotate(
                total_votes=models.Count('votes', filter=models.Q(votes__vote='ACCURATE'))
            ).order_by('-total_votes', '-created_at')
        else:  # newest
            queryset = queryset.order_by('-created_at')

        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = DiffItemSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DiffItemSerializer(queryset, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=['get'], url_path='comments')
    def comments(self, request, username=None):
        """
        Get comments posted by a specific user.

        Query params:
        - ordering: 'newest' (default)
        - page: page number
        - page_size: items per page (max 100)
        """
        from diffs.models import DiffComment
        from diffs.serializers import DiffCommentSerializer

        user = self.get_object()

        # Get user's comments (only LIVE status)
        queryset = DiffComment.objects.filter(
            user=user,
            status='LIVE'
        ).select_related('diff_item', 'diff_item__work', 'diff_item__screen_work', 'user')

        # Apply ordering (always newest for now)
        queryset = queryset.order_by('-created_at')

        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = DiffCommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DiffCommentSerializer(queryset, many=True)
        return response.Response(serializer.data)

    @decorators.action(detail=True, methods=['get'], url_path='votes', permission_classes=[permissions.IsAuthenticated])
    def votes(self, request, username=None):
        """
        Get votes cast by a specific user (comparison votes: Book vs Screen preference).

        Only accessible to the user themselves (private data).

        Query params:
        - ordering: 'newest' (default)
        - page: page number
        - page_size: items per page (max 100)
        """
        from diffs.models import ComparisonVote
        from diffs.serializers import ComparisonVoteSerializer

        user = self.get_object()

        # Only allow users to view their own votes
        if request.user != user:
            return response.Response(
                {'error': 'You can only view your own voting history'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get user's comparison votes
        queryset = ComparisonVote.objects.filter(
            user=user
        ).select_related('work', 'screen_work')

        # Apply ordering (always newest for now)
        queryset = queryset.order_by('-created_at')

        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = ComparisonVoteSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ComparisonVoteSerializer(queryset, many=True)
        return response.Response(serializer.data)


class SignupView(APIView):
    """View for user registration."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Create a new user account."""
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            user_data = UserDetailSerializer(user).data

            return response.Response(
                {
                    'user': user_data,
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                status=status.HTTP_201_CREATED
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """View for user login."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """Authenticate user and return JWT tokens."""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)
            if user is not None:
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                user_data = UserDetailSerializer(user).data

                return response.Response(
                    {
                        'user': user_data,
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    },
                    status=status.HTTP_200_OK
                )
            return response.Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """View for user logout."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Blacklist the refresh token."""
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return response.Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Exception:
            return response.Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CurrentUserView(APIView):
    """View for getting current user information."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return current user details."""
        serializer = UserDetailSerializer(request.user)
        return response.Response(serializer.data, status=status.HTTP_200_OK)


class BookmarkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user bookmarks."""

    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Return bookmarks for the current user."""
        return Bookmark.objects.filter(user=self.request.user).select_related(
            'work', 'screen_work'
        )

    def perform_create(self, serializer):
        """Set the user to the current user when creating a bookmark."""
        serializer.save(user=self.request.user)

    @decorators.action(detail=False, methods=['post'], url_path='check')
    def check(self, request):
        """
        Check if a comparison is bookmarked by the current user.

        Expected POST data: {"work": <work_id>, "screen_work": <screen_work_id>}
        Returns: {"is_bookmarked": true/false, "bookmark_id": <id> or null}
        """
        work_id = request.data.get('work')
        screen_work_id = request.data.get('screen_work')

        if not work_id or not screen_work_id:
            return response.Response(
                {'error': 'Both work and screen_work IDs are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            bookmark = Bookmark.objects.get(
                user=request.user,
                work_id=work_id,
                screen_work_id=screen_work_id
            )
            return response.Response({
                'is_bookmarked': True,
                'bookmark_id': bookmark.id
            }, status=status.HTTP_200_OK)
        except Bookmark.DoesNotExist:
            return response.Response({
                'is_bookmarked': False,
                'bookmark_id': None
            }, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=['delete'], url_path='delete-by-comparison')
    def delete_by_comparison(self, request):
        """
        Delete a bookmark by work and screen_work IDs.

        Query params: work=<work_id>&screen_work=<screen_work_id>
        """
        work_id = request.query_params.get('work')
        screen_work_id = request.query_params.get('screen_work')

        if not work_id or not screen_work_id:
            return response.Response(
                {'error': 'Both work and screen_work query parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            bookmark = Bookmark.objects.get(
                user=request.user,
                work_id=work_id,
                screen_work_id=screen_work_id
            )
            bookmark.delete()
            return response.Response(
                {'message': 'Bookmark deleted successfully'},
                status=status.HTTP_200_OK
            )
        except Bookmark.DoesNotExist:
            return response.Response(
                {'error': 'Bookmark not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for user notifications."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        """Return notifications for the current user."""
        return Notification.objects.filter(user=self.request.user)

    @decorators.action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return response.Response({'count': count}, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark a notification as read."""
        notification = self.get_object()

        # Ensure user owns this notification
        if notification.user != request.user:
            return response.Response(
                {'error': 'Not your notification'},
                status=status.HTTP_403_FORBIDDEN
            )

        notification.is_read = True
        notification.save()
        return response.Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)

    @decorators.action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all notifications for the current user as read."""
        count = Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return response.Response(
            {'message': f'{count} notifications marked as read', 'count': count},
            status=status.HTTP_200_OK
        )


# Onboarding Views

class UsernameCheckThrottle(UserRateThrottle):
    """Rate limit for username checks."""

    rate = '10/min'


@decorators.api_view(['POST'])
@decorators.permission_classes([permissions.IsAuthenticated])
@decorators.throttle_classes([UsernameCheckThrottle])
def check_username(request):
    """
    Check username availability and return suggestions.

    POST /api/users/me/username/check/
    Body: { "username": "desired_username" }
    """
    from .services.username_service import (
        validate_username,
        check_username_availability,
        generate_username_suggestions,
    )

    username = request.data.get('username', '').strip()

    if not username:
        return response.Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate username
    is_valid, error_code = validate_username(username)

    if not is_valid:
        error_messages = {
            'invalid_format': 'Invalid username format',
            'reserved': 'Username is reserved',
            'profanity': 'Username contains inappropriate content',
        }
        return response.Response({
            'available': False,
            'error': error_code,
            'message': error_messages.get(error_code, 'Invalid username'),
            'suggestions': generate_username_suggestions(username, count=5)
        })

    # Check availability
    available = check_username_availability(username)

    return response.Response({
        'available': available,
        'suggestions': [] if available else generate_username_suggestions(username, count=5)
    })


@decorators.api_view(['POST'])
@decorators.permission_classes([permissions.IsAuthenticated])
def set_username(request):
    """
    Set username for current user.

    POST /api/users/me/username/
    Body: { "username": "chosen_username" }
    """
    from .services.username_service import (
        validate_username,
        check_username_availability,
    )

    username = request.data.get('username', '').strip()
    user = request.user

    if not username:
        return response.Response(
            {'error': 'Username is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate username
    is_valid, error_code = validate_username(username)
    if not is_valid:
        return response.Response(
            {'error': 'Username validation failed', 'detail': error_code},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check availability
    if not check_username_availability(username):
        return response.Response(
            {'error': 'Username already taken'},
            status=status.HTTP_409_CONFLICT
        )

    # Set username and update onboarding state
    try:
        user.username = username
        if user.onboarding_step < 2:
            user.onboarding_step = 2
        if not user.onboarding_started_at:
            user.onboarding_started_at = timezone.now()
        user.save()
    except IntegrityError:
        # Race condition: username was taken between check and save
        return response.Response(
            {'error': 'Username already taken'},
            status=status.HTTP_409_CONFLICT
        )

    serializer = UserDetailSerializer(user)
    return response.Response({
        'success': True,
        'user': serializer.data
    })


@decorators.api_view(['POST'])
@decorators.permission_classes([permissions.IsAuthenticated])
def set_preferences(request):
    """
    Create or update user preferences.

    POST /api/users/me/preferences/
    Body: {
        "genres": ["Fantasy", "Sci-Fi"],
        "book_vs_screen": "EQUAL",
        "contribution_interest": "ADD_DIFFS"
    }
    """
    user = request.user

    # Get or create preferences
    preferences, created = UserPreferences.objects.get_or_create(user=user)

    serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()

        # Update onboarding state
        if user.onboarding_step < 3:
            user.onboarding_step = 3
            user.save()

        return response.Response({
            'success': True,
            'preferences': serializer.data
        })

    return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@decorators.api_view(['GET'])
@decorators.permission_classes([permissions.IsAuthenticated])
def suggested_comparisons(request):
    """
    Get personalized comparison suggestions based on user preferences.

    GET /api/users/me/suggested-comparisons/
    """
    from screen.models import AdaptationEdge
    from diffs.models import DiffItem
    from django.db.models import Count, Q

    user = request.user

    # Get user preferences if they exist
    try:
        preferences = user.preferences
    except UserPreferences.DoesNotExist:
        preferences = None

    intent = preferences.contribution_interest if preferences else 'EXPLORE'

    # Get adaptation edges with related work/screen data
    edges = AdaptationEdge.objects.select_related('work', 'screen_work').all()

    # Filter by user's preferred genres if they exist
    if preferences and preferences.genres:
        # Filter edges where work.genre is in user's preferred genres
        genre_filters = Q()
        for genre in preferences.genres:
            genre_filters |= Q(work__genre__icontains=genre)
        edges = edges.filter(genre_filters)

    # Annotate with diff count
    from django.db.models import F
    edges = edges.annotate(
        diff_count=Count('work__diffs', filter=Q(work__diffs__screen_work=F('screen_work')))
    )

    # Order by diff count (descending) for now
    # TODO: Implement intent-based ranking
    edges = edges.order_by('-diff_count', '-screen_work__tmdb_popularity')[:10]

    # Format response
    comparisons = []
    for edge in edges:
        # Get genres from work or screen_work
        genres = []
        if edge.work.genre:
            genres = [edge.work.genre]
        if edge.screen_work.genres:
            genres.extend(edge.screen_work.genres[:2])
        genres = list(set(genres))[:3]  # Dedupe and limit to 3

        comparisons.append({
            'work_slug': edge.work.slug,
            'work_title': edge.work.title,
            'screen_work_slug': edge.screen_work.slug,
            'screen_work_title': edge.screen_work.title,
            'genres': genres,
            'diff_count': edge.diff_count
        })

    return response.Response({
        'comparisons': comparisons,
        'intent': intent
    })


@decorators.api_view(['PATCH'])
@decorators.permission_classes([permissions.IsAuthenticated])
def update_onboarding(request):
    """
    Update onboarding progress.

    PATCH /api/users/me/onboarding/
    Body: {
        "onboarding_step": 3,
        "onboarding_completed": true
    }
    """
    user = request.user

    if 'onboarding_step' in request.data:
        user.onboarding_step = int(request.data['onboarding_step'])

    if 'onboarding_completed' in request.data:
        # Convert to boolean (handles string 'true'/'false' from some clients)
        completed = request.data['onboarding_completed']
        if isinstance(completed, str):
            user.onboarding_completed = completed.lower() in ('true', '1', 'yes')
        else:
            user.onboarding_completed = bool(completed)
        if user.onboarding_completed and not user.onboarding_completed_at:
            user.onboarding_completed_at = timezone.now()

    if not user.onboarding_started_at:
        user.onboarding_started_at = timezone.now()

    user.save()

    return response.Response({
        'success': True,
        'onboarding_step': user.onboarding_step,
        'onboarding_completed': user.onboarding_completed
    })
