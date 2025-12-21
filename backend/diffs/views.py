"""Views for diffs app."""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q, F, ExpressionWrapper, IntegerField, Case, When
from .models import DiffItem, DiffVote, DiffComment, SpoilerScope, ComparisonVote
from .serializers import DiffItemSerializer, DiffVoteSerializer, DiffCommentSerializer, ComparisonVoteSerializer


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
        """Filter queryset based on spoiler scope and apply ordering."""
        queryset = super().get_queryset()
        spoiler_scope = self.request.query_params.get('max_spoiler_scope', None)
        ordering = self.request.query_params.get('ordering', 'best')

        # Filter by spoiler scope
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

        # Annotate with vote metrics
        queryset = queryset.annotate(
            accurate_count=Count(
                Case(When(votes__vote='ACCURATE', then=1)),
                distinct=True
            ),
            disagree_count=Count(
                Case(When(votes__vote='DISAGREE', then=1)),
                distinct=True
            ),
            nuance_count=Count(
                Case(When(votes__vote='NEEDS_NUANCE', then=1)),
                distinct=True
            ),
            total_votes=F('accurate_count') + F('disagree_count') + F('nuance_count'),
            net_score=F('accurate_count') - F('disagree_count'),
            # Controversial score: high total votes with divisive split
            controversy_score=ExpressionWrapper(
                F('total_votes') * Case(
                    # If votes are split close to 50/50, controversy is high
                    When(total_votes__gt=0, then=(
                        1.0 - (F('accurate_count') - F('disagree_count')) *
                        (F('accurate_count') - F('disagree_count')) /
                        (F('total_votes') * F('total_votes'))
                    )),
                    default=0.0,
                    output_field=IntegerField()
                ),
                output_field=IntegerField()
            )
        )

        # Apply ordering
        if ordering == 'new':
            queryset = queryset.order_by('-created_at')
        elif ordering == 'controversial':
            queryset = queryset.order_by('-controversy_score', '-total_votes', '-created_at')
        else:  # 'best' is default
            queryset = queryset.order_by('-net_score', '-accurate_count', '-created_at')

        return queryset

    def perform_create(self, serializer):
        """Set the created_by field to the current user and status to LIVE."""
        serializer.save(created_by=self.request.user, status='LIVE')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote on a diff item. If voting the same value, remove the vote (toggle)."""
        diff_item = self.get_object()
        vote_value = request.data.get('vote')

        if not vote_value:
            return Response(
                {'error': 'vote field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user already has a vote
        existing_vote = DiffVote.objects.filter(
            diff_item=diff_item,
            user=request.user
        ).first()

        # If voting the same value, remove the vote (toggle off)
        if existing_vote and existing_vote.vote == vote_value:
            existing_vote.delete()
            return Response(
                {'message': 'Vote removed', 'removed': True},
                status=status.HTTP_200_OK
            )

        # Otherwise, create or update the vote
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


class ComparisonVoteViewSet(viewsets.ModelViewSet):
    """ViewSet for ComparisonVote model."""

    queryset = ComparisonVote.objects.all().select_related('user', 'work', 'screen_work')
    serializer_class = ComparisonVoteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['work', 'screen_work']
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']

    def get_queryset(self):
        """Filter queryset to only show votes for the requested comparison."""
        queryset = super().get_queryset()
        work_id = self.request.query_params.get('work')
        screen_work_id = self.request.query_params.get('screen_work')

        if work_id and screen_work_id:
            queryset = queryset.filter(work_id=work_id, screen_work_id=screen_work_id)

        return queryset

    def perform_create(self, serializer):
        """Set the user field to the current user."""
        # Check if user already has a vote for this comparison
        work = serializer.validated_data['work']
        screen_work = serializer.validated_data['screen_work']

        existing_vote = ComparisonVote.objects.filter(
            work=work,
            screen_work=screen_work,
            user=self.request.user
        ).first()

        if existing_vote:
            # Update existing vote instead of creating new one
            for key, value in serializer.validated_data.items():
                setattr(existing_vote, key, value)
            existing_vote.save()
            serializer.instance = existing_vote
        else:
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        """Get aggregated voting statistics for a comparison."""
        work_id = request.query_params.get('work')
        screen_work_id = request.query_params.get('screen_work')

        if not work_id or not screen_work_id:
            return Response(
                {'error': 'work and screen_work parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all votes for this comparison (only from users who confirmed consumption)
        votes = ComparisonVote.objects.filter(
            work_id=work_id,
            screen_work_id=screen_work_id,
            has_read_book=True,
            has_watched_adaptation=True
        )

        total_votes = votes.count()

        # Preference distribution
        preference_stats = votes.values('preference').annotate(
            count=Count('id')
        )

        preference_breakdown = {
            'BOOK': 0,
            'SCREEN': 0,
            'TIE': 0,
            'DIDNT_FINISH': 0
        }

        for stat in preference_stats:
            preference_breakdown[stat['preference']] = stat['count']

        # Faithfulness rating stats (exclude DIDNT_FINISH votes)
        completed_votes = votes.exclude(preference='DIDNT_FINISH')
        faithfulness_stats = completed_votes.aggregate(
            avg_rating=Avg('faithfulness_rating'),
            count=Count('faithfulness_rating')
        )

        # Get user's vote if authenticated
        user_vote = None
        if request.user.is_authenticated:
            user_vote_obj = votes.filter(user=request.user).first()
            if user_vote_obj:
                user_vote = ComparisonVoteSerializer(user_vote_obj).data

        return Response({
            'total_votes': total_votes,
            'preference_breakdown': preference_breakdown,
            'faithfulness': {
                'average': round(faithfulness_stats['avg_rating'], 2) if faithfulness_stats['avg_rating'] else None,
                'count': faithfulness_stats['count']
            },
            'user_vote': user_vote
        })
