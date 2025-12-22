"""Management command to re-extract genres using improved logic."""
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from ingestion.openlibrary import extract_primary_genre
import requests


class Command(BaseCommand):
    help = 'Re-extract genres for all books using improved logic'

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

    def handle(self, *args, **options):
        limit = options.get('limit')
        dry_run = options.get('dry_run')

        # Get all works with valid Open Library IDs
        works = Work.objects.exclude(openlibrary_work_id='').exclude(openlibrary_work_id__isnull=True)
        # Filter out 'None' string values
        works = works.exclude(openlibrary_work_id='None')

        if limit:
            works = works[:limit]

        total = works.count()
        self.stdout.write(f'Processing {total} books...\n')

        updated = 0
        unchanged = 0
        failed = 0

        for i, work in enumerate(works, 1):
            if i % 50 == 0:
                self.stdout.write(f'Processed {i}/{total} books...')

            try:
                # Skip if invalid ID
                if not work.openlibrary_work_id or work.openlibrary_work_id == 'None':
                    unchanged += 1
                    continue

                # Fetch Open Library data
                url = f"{settings.OPEN_LIBRARY_BASE_URL}/works/{work.openlibrary_work_id}.json"
                response = requests.get(url, timeout=10)
                response.raise_for_status()
                ol_data = response.json()

                # Extract new genre
                subjects = ol_data.get('subjects', [])
                new_genre = extract_primary_genre(subjects) if subjects else ''

                # Compare with current
                old_genre = work.genre or ''

                if new_genre != old_genre:
                    if dry_run:
                        self.stdout.write(
                            f'[DRY RUN] {work.title}: "{old_genre}" -> "{new_genre}"'
                        )
                    else:
                        work.genre = new_genre
                        work.save(update_fields=['genre'])

                    updated += 1
                else:
                    unchanged += 1

            except Exception as e:
                self.stderr.write(f'Failed to process {work.title}: {str(e)}')
                failed += 1
                continue

        # Summary
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Updated: {updated}'))
        self.stdout.write(f'  Unchanged: {unchanged}')
        if failed:
            self.stdout.write(self.style.ERROR(f'  Failed: {failed}'))

        if dry_run:
            self.stdout.write(self.style.WARNING('\nDRY RUN - No changes were saved'))
        else:
            self.stdout.write(self.style.SUCCESS('\nGenres updated successfully!'))
