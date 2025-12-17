"""Business logic services for screen app."""
from typing import Optional
from .models import ScreenWork, AdaptationEdge
from works.models import Work


class ScreenWorkService:
    """Service class for ScreenWork-related business logic."""

    @staticmethod
    def get_or_create_from_wikidata(
        qid: str,
        title: str,
        screen_type: str,
        **kwargs
    ) -> tuple[ScreenWork, bool]:
        """Get or create a ScreenWork from Wikidata QID."""
        screen_work, created = ScreenWork.objects.get_or_create(
            wikidata_qid=qid,
            defaults={'title': title, 'type': screen_type, **kwargs}
        )
        return screen_work, created

    @staticmethod
    def get_or_create_from_tmdb(
        tmdb_id: int,
        title: str,
        screen_type: str,
        **kwargs
    ) -> tuple[ScreenWork, bool]:
        """Get or create a ScreenWork from TMDb ID."""
        screen_work, created = ScreenWork.objects.get_or_create(
            tmdb_id=tmdb_id,
            defaults={'title': title, 'type': screen_type, **kwargs}
        )
        return screen_work, created


class AdaptationEdgeService:
    """Service class for AdaptationEdge-related business logic."""

    @staticmethod
    def create_edge(
        work: Work,
        screen_work: ScreenWork,
        relation_type: str = AdaptationEdge.RelationType.BASED_ON,
        source: str = AdaptationEdge.Source.WIKIDATA,
        confidence: int = 100
    ) -> tuple[AdaptationEdge, bool]:
        """Create or get an adaptation edge between a work and screen work."""
        edge, created = AdaptationEdge.objects.get_or_create(
            work=work,
            screen_work=screen_work,
            defaults={
                'relation_type': relation_type,
                'source': source,
                'confidence': confidence,
            }
        )
        return edge, created
