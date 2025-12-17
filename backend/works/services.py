"""Business logic services for works app."""
from typing import Optional
from .models import Work


class WorkService:
    """Service class for Work-related business logic."""

    @staticmethod
    def get_or_create_from_wikidata(qid: str, title: str, **kwargs) -> tuple[Work, bool]:
        """Get or create a Work from Wikidata QID."""
        work, created = Work.objects.get_or_create(
            wikidata_qid=qid,
            defaults={'title': title, **kwargs}
        )
        return work, created

    @staticmethod
    def get_or_create_from_openlibrary(ol_work_id: str, title: str, **kwargs) -> tuple[Work, bool]:
        """Get or create a Work from Open Library work ID."""
        work, created = Work.objects.get_or_create(
            openlibrary_work_id=ol_work_id,
            defaults={'title': title, **kwargs}
        )
        return work, created
