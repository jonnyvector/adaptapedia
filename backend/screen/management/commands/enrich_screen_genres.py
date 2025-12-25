"""Management command to enrich screen works with genre data from TMDb."""
from django.core.management.base import BaseCommand
from screen.models import ScreenWork
from ingestion.tmdb import enrich_screenwork_from_tmdb


class Command(BaseCommand):
    """Enrich screen works with genre data from TMDb."""

    help = 'Enrich screen works with genre metadata from TMDb'

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of screen works to enrich',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-enrich even if genres already exist',
        )

    def handle(self, *args, **options):
        """Handle the command execution."""
        limit = options['limit']
        force = options['force']

        # Get screen works that need genre enrichment
        if force:
            queryset = ScreenWork.objects.filter(tmdb_id__isnull=False)
        else:
            queryset = ScreenWork.objects.filter(
                tmdb_id__isnull=False,
                primary_genre__in=['', None]
            )

        if limit:
            queryset = queryset[:limit]

        total = queryset.count()
        self.stdout.write(f'Found {total} screen works to enrich with genres')

        success_count = 0
        error_count = 0

        for i, screen_work in enumerate(queryset, 1):
            self.stdout.write(
                f'[{i}/{total}] Enriching {screen_work.title} ({screen_work.year})...'
            )

            try:
                result = enrich_screenwork_from_tmdb(screen_work.id)
                if result.get('success'):
                    primary_genre = result.get('primary_genre', '')
                    genres_list = result.get('genres', [])
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'  ✓ Success: {primary_genre} ({", ".join(genres_list)})'
                        )
                    )
                    success_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(f'  ✗ Failed: {result.get("error", "Unknown error")}')
                    )
                    error_count += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Exception: {str(e)}')
                )
                error_count += 1

        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(
            self.style.SUCCESS(f'Successfully enriched: {success_count}/{total}')
        )
        if error_count > 0:
            self.stdout.write(
                self.style.ERROR(f'Errors: {error_count}/{total}')
            )
