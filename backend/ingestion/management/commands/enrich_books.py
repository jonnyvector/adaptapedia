"""Management command to enrich books with Open Library metadata."""
from django.core.management.base import BaseCommand
from works.models import Work
from ingestion.openlibrary import enrich_work_from_openlibrary


class Command(BaseCommand):
    """Enrich books with Open Library metadata."""

    help = 'Enrich books with Open Library metadata (author, genre, description)'

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of books to enrich'
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Only enrich books missing author or genre'
        )

    def handle(self, *args, **options):
        """Execute the command."""
        limit = options['limit']
        missing_only = options['missing_only']

        # Get books to enrich
        queryset = Work.objects.all()

        if missing_only:
            queryset = queryset.filter(author='') | queryset.filter(genre='')

        if limit:
            queryset = queryset[:limit]

        total = queryset.count()
        self.stdout.write(f'Enriching {total} books...')

        success_count = 0
        error_count = 0

        for i, work in enumerate(queryset, 1):
            self.stdout.write(f'[{i}/{total}] Enriching: {work.title}')

            result = enrich_work_from_openlibrary(work.id)

            if result.get('success'):
                success_count += 1
            else:
                error_count += 1
                error = result.get('error', 'Unknown error')
                self.stdout.write(self.style.WARNING(f'  Error: {error}'))

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Success: {success_count}, Errors: {error_count}'
        ))
