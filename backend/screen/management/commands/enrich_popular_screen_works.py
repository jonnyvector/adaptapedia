"""Management command to enrich the most popular screen works with genre data."""
from django.core.management.base import BaseCommand
from screen.models import ScreenWork
from ingestion.tmdb import enrich_screenwork_from_tmdb


class Command(BaseCommand):
    """Enrich the most popular screen works with genre metadata from TMDb."""

    help = 'Enrich the most popular screen works (by TMDb popularity) with genre data'

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            '--limit',
            type=int,
            default=200,
            help='Number of popular screen works to enrich (default: 200)',
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

        # Get most popular screen works that have TMDb IDs
        # Order by TMDb popularity (higher = more popular)
        if force:
            queryset = ScreenWork.objects.filter(
                tmdb_id__isnull=False
            ).order_by('-tmdb_popularity')[:limit]
        else:
            queryset = ScreenWork.objects.filter(
                tmdb_id__isnull=False,
                primary_genre__in=['', None]
            ).order_by('-tmdb_popularity')[:limit]

        total = queryset.count()
        self.stdout.write(
            self.style.SUCCESS(
                f'Found {total} popular screen works to enrich with genres'
            )
        )

        success_count = 0
        error_count = 0

        for i, screen_work in enumerate(queryset, 1):
            self.stdout.write(
                f'[{i}/{total}] Enriching {screen_work.title} ({screen_work.year}) '
                f'[popularity: {screen_work.tmdb_popularity:.1f}]...'
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
