"""Management command to sync genres from TMDb screen adaptations to books."""
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from screen.models import AdaptationEdge
from ingestion.tmdb import extract_genres_from_tmdb, TMDB_GENRE_MAPPING
import requests


class Command(BaseCommand):
    help = 'Sync genres from TMDb screen adaptations to source books'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of books to process',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would change without saving',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Overwrite existing genres',
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        dry_run = options.get('dry_run')
        force = options.get('force')

        if not settings.TMDB_API_KEY:
            self.stderr.write(self.style.ERROR('TMDb API key not configured'))
            return

        # Get all works that have adaptations with TMDb IDs
        works_query = Work.objects.filter(
            adaptations__screen_work__tmdb_id__isnull=False
        ).distinct()

        if not force:
            # Only process books without genres
            works_query = works_query.filter(genre='')

        if limit:
            works_query = works_query[:limit]

        total = works_query.count()
        self.stdout.write(f'Processing {total} books...\n')

        updated = 0
        skipped = 0
        failed = 0
        genre_stats = {}

        for work in works_query:
            try:
                # Get the most popular adaptation (highest TMDb popularity)
                adaptation = AdaptationEdge.objects.filter(
                    work=work,
                    screen_work__tmdb_id__isnull=False
                ).select_related('screen_work').order_by(
                    '-screen_work__tmdb_popularity'
                ).first()

                if not adaptation:
                    skipped += 1
                    continue

                screen_work = adaptation.screen_work

                # Fetch TMDb data
                media_type = 'movie' if screen_work.type == 'MOVIE' else 'tv'
                detail_url = f"https://api.themoviedb.org/3/{media_type}/{screen_work.tmdb_id}"
                params = {'api_key': settings.TMDB_API_KEY}

                response = requests.get(detail_url, params=params, timeout=10)
                response.raise_for_status()
                tmdb_data = response.json()

                # Extract genre
                genre = extract_genres_from_tmdb(tmdb_data)

                if genre:
                    old_genre = work.genre or '(empty)'

                    if dry_run:
                        self.stdout.write(
                            f'{work.title}: "{old_genre}" -> "{genre}" (from {screen_work.title})'
                        )
                    else:
                        work.genre = genre
                        work.save(update_fields=['genre'])

                    # Track stats
                    genre_stats[genre] = genre_stats.get(genre, 0) + 1
                    updated += 1
                else:
                    skipped += 1

            except Exception as e:
                self.stderr.write(f'Failed to process {work.title}: {str(e)}')
                failed += 1
                continue

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Updated: {updated}'))
        self.stdout.write(f'  Skipped: {skipped}')
        if failed:
            self.stdout.write(self.style.ERROR(f'  Failed: {failed}'))

        if genre_stats:
            self.stdout.write('\n' + '=' * 70)
            self.stdout.write(self.style.SUCCESS('\nGenre distribution:'))
            for genre, count in sorted(genre_stats.items(), key=lambda x: -x[1]):
                self.stdout.write(f'  {count:4d} - {genre}')

        if dry_run:
            self.stdout.write('\n' + self.style.WARNING('DRY RUN - No changes were saved'))
        else:
            self.stdout.write('\n' + self.style.SUCCESS('Genres synced successfully!'))
