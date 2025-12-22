"""Management command to enrich screen works with TMDb data."""
from django.core.management.base import BaseCommand
from django.conf import settings
from screen.models import ScreenWork
from ingestion.tmdb import enrich_screenwork_from_tmdb
import time


class Command(BaseCommand):
    help = 'Enrich screen works with TMDb metadata (posters, summaries, genres, etc.)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of screen works to process',
        )
        parser.add_argument(
            '--missing-only',
            action='store_true',
            help='Only enrich screen works without TMDb IDs or missing data',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Re-enrich all screen works even if they have data',
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=0.25,
            help='Delay in seconds between API calls (default: 0.25 for rate limiting)',
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        missing_only = options.get('missing_only')
        force = options.get('force')
        delay = options.get('delay')

        if not settings.TMDB_API_KEY:
            self.stderr.write(self.style.ERROR('TMDb API key not configured'))
            return

        # Build query
        screenworks = ScreenWork.objects.all()

        if missing_only:
            # Only enrich works that are missing data
            screenworks = screenworks.filter(
                tmdb_id__isnull=True
            ) | screenworks.filter(
                summary=''
            ) | screenworks.filter(
                poster_url__isnull=True
            )

        if limit:
            screenworks = screenworks[:limit]

        total = screenworks.count()
        self.stdout.write(f'Processing {total} screen works...\n')

        enriched = 0
        skipped = 0
        failed = 0

        for i, screenwork in enumerate(screenworks, 1):
            if i % 50 == 0:
                self.stdout.write(f'Processed {i}/{total} ({i*100//total}%)...')

            try:
                result = enrich_screenwork_from_tmdb(screenwork.id)

                if result.get('success'):
                    enriched += 1
                    if i % 10 == 0:
                        self.stdout.write(
                            f'  ✓ {screenwork.title} ({screenwork.year or "?"}) - {result.get("genre", "no genre")}'
                        )
                else:
                    skipped += 1

                # Rate limiting - TMDb allows 40 requests per 10 seconds
                time.sleep(delay)

            except Exception as e:
                self.stderr.write(f'Failed to process {screenwork.title}: {str(e)}')
                failed += 1
                continue

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Enriched: {enriched}'))
        self.stdout.write(f'  Skipped: {skipped}')
        if failed:
            self.stdout.write(self.style.ERROR(f'  Failed: {failed}'))

        self.stdout.write('\n' + self.style.SUCCESS('Screen works enriched successfully!'))
        self.stdout.write('\nNext step: Run "python manage.py sync_genres_from_tmdb" to sync genres to books')
