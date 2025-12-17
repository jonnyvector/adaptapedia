"""Views for diffs app."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import DiffItem, DiffVote, DiffComment, SpoilerScope
from .serializers import DiffItemSerializer, DiffVoteSerializer, DiffCommentSerializer


class DiffItemViewSet(viewsets.ModelViewSet):
    """ViewSet for DiffItem model."""

    queryset = DiffItem.objects.filter(status='LIVE').select_related(
        'work', 'screen_work', 'created_by'
    ).prefetch_related('votes')
    serializer_class = DiffItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['work', 'screen_work', 'category', 'spoiler_scope']

    def get_queryset(self):
        """Filter queryset based on spoiler scope if provided."""
        queryset = super().get_queryset()
        spoiler_scope = self.request.query_params.get('max_spoiler_scope', None)

        if spoiler_scope:
            # Order by spoiler severity: NONE < BOOK_ONLY/SCREEN_ONLY < FULL
            scope_order = {
                SpoilerScope.NONE: 0,
                SpoilerScope.BOOK_ONLY: 1,
                SpoilerScope.SCREEN_ONLY: 1,
                SpoilerScope.FULL: 2,
            }
            max_level = scope_order.get(spoiler_scope, 0)
            allowed_scopes = [k for k, v in scope_order.items() if v <= max_level]
            queryset = queryset.filter(spoiler_scope__in=allowed_scopes)

        return queryset

    def perform_create(self, serializer):
        """Set the created_by field to the current user."""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote on a diff item."""
        diff_item = self.get_object()
        vote_value = request.data.get('vote')

        if not vote_value:
            return Response(
                {'error': 'vote field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        vote, created = DiffVote.objects.update_or_create(
            diff_item=diff_item,
            user=request.user,
            defaults={'vote': vote_value}
        )

        serializer = DiffVoteSerializer(vote)
        return Response(serializer.data, status=status.HTTP_200_OK)


class DiffCommentViewSet(viewsets.ModelViewSet):
    """ViewSet for DiffComment model."""

    queryset = DiffComment.objects.filter(status='LIVE').select_related('user', 'diff_item')
    serializer_class = DiffCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['diff_item']

    def perform_create(self, serializer):
        """Set the user field to the current user."""
        serializer.save(user=self.request.user)
