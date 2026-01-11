"""Service for generating personalized comparison recommendations."""
from typing import List, Dict, Any, Optional
from django.db.models import Count, Q, F
from ..models import User, UserPreferences


class RecommendationService:
    """Service for generating personalized recommendations for users."""

    @staticmethod
    def get_suggested_comparisons(user: User, limit: int = 10) -> tuple[List[Dict[str, Any]], str]:
        """
        Get personalized comparison suggestions based on user preferences.

        Args:
            user: User to get recommendations for
            limit: Maximum number of suggestions to return

        Returns:
            Tuple of (comparisons list, intent string)
            comparisons: List of dicts with work/screen_work info
            intent: User's contribution interest (EXPLORE, ADD_DIFFS, etc.)
        """
        from screen.models import AdaptationEdge

        # Get user preferences if they exist
        try:
            preferences = user.preferences
        except UserPreferences.DoesNotExist:
            preferences = None

        intent = preferences.contribution_interest if preferences else 'EXPLORE'

        # Get adaptation edges with related work/screen data
        base_edges = AdaptationEdge.objects.select_related('work', 'screen_work').all()

        # Annotate with diff count for this specific pairing
        base_edges = base_edges.annotate(
            diff_count=Count('work__diffs', filter=Q(work__diffs__screen_work=F('screen_work')))
        )

        # Filter by user's preferred genres if they exist
        # Check both work genres AND screen_work genres for better matching
        if preferences and preferences.genres:
            genre_filters = Q()
            for genre in preferences.genres:
                # Check work genre (book genre from Open Library)
                genre_filters |= Q(work__genre__icontains=genre)
                # Also check screen_work genres (from TMDb) - stored as JSON array
                genre_filters |= Q(screen_work__genres__icontains=genre)

            filtered_edges = base_edges.filter(genre_filters)

            # If genre filtering returns too few results (< 5), fall back to popular comparisons
            # This prevents recommending the same single comparison repeatedly
            if filtered_edges.count() < 5:
                edges = base_edges
            else:
                edges = filtered_edges
        else:
            edges = base_edges

        # Order by diff count (descending) and popularity
        # TODO: Implement intent-based ranking
        edges = edges.order_by('-diff_count', '-screen_work__tmdb_popularity')[:limit]

        # Format response
        comparisons = RecommendationService._format_comparison_edges(edges)

        return comparisons, intent

    @staticmethod
    def _format_comparison_edges(edges) -> List[Dict[str, Any]]:
        """
        Format adaptation edges into comparison dicts.

        Args:
            edges: QuerySet of AdaptationEdge objects with annotations

        Returns:
            List of dicts with formatted comparison data
        """
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

        return comparisons
