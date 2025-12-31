"""Views for users app."""
from rest_framework import viewsets, permissions, decorators, response, status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models
from django.shortcuts import get_object_or_404
from adaptapedia.throttles import AuthRateThrottle
from .models import User, Bookmark, Notification
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    SignupSerializer,
    LoginSerializer,
    UserDetailSerializer,
    BookmarkSerializer,
    NotificationSerializer,
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
        Get votes cast by a specific user.

        Only accessible to the user themselves (private data).

        Query params:
        - ordering: 'newest' (default)
        - page: page number
        - page_size: items per page (max 100)
        """
        from diffs.models import DiffVote
        from diffs.serializers import DiffVoteSerializer

        user = self.get_object()

        # Only allow users to view their own votes
        if request.user != user:
            return response.Response(
                {'error': 'You can only view your own voting history'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get user's votes
        queryset = DiffVote.objects.filter(
            user=user
        ).select_related('diff_item', 'diff_item__work', 'diff_item__screen_work', 'diff_item__created_by')

        # Apply ordering (always newest for now)
        queryset = queryset.order_by('-created_at')

        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = DiffVoteSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DiffVoteSerializer(queryset, many=True)
        return response.Response(serializer.data)


class SignupView(APIView):
    """View for user registration."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

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
    throttle_classes = [AuthRateThrottle]

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
        from users.services import NotificationService
        count = NotificationService.get_unread_count(request.user)
        return response.Response({'count': count}, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        """Mark a notification as read."""
        from users.services import NotificationService
        notification = self.get_object()

        # Ensure user owns this notification
        if notification.user != request.user:
            return response.Response(
                {'error': 'Not your notification'},
                status=status.HTTP_403_FORBIDDEN
            )

        success = NotificationService.mark_as_read(notification.id)
        if success:
            return response.Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
        return response.Response({'error': 'Failed to mark as read'}, status=status.HTTP_400_BAD_REQUEST)

    @decorators.action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """Mark all notifications for the current user as read."""
        from users.services import NotificationService
        count = NotificationService.mark_all_read(request.user)
        return response.Response(
            {'message': f'{count} notifications marked as read', 'count': count},
            status=status.HTTP_200_OK
        )
