"""Management command to enrich books with missing author/genre from Google Books."""
import time
from django.core.management.base import BaseCommand
from works.models import Work
from works.utils.google_books import search_book


class Command(BaseCommand):
    help = 'Enrich books with missing author/genre metadata from Google Books API'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=None,
            help='Limit number of books to process',
        )
        parser.add_argument(
            '--delay',
            type=float,
            default=1.0,
            help='Delay in seconds between API calls (default: 1.0 for rate limiting)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without saving',
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        delay = options.get('delay')
        dry_run = options.get('dry_run')

        # Find books missing author or genre
        works = Work.objects.filter(author__isnull=True) | Work.objects.filter(author='') | \
                Work.objects.filter(genre__isnull=True) | Work.objects.filter(genre='')

        # Remove duplicates
        works = works.distinct()

        if limit:
            works = works[:limit]

        total = works.count()
        self.stdout.write(f'Processing {total} books with missing author/genre data...\n')

        enriched = 0
        skipped = 0
        failed = 0

        for i, work in enumerate(works, 1):
            if i % 10 == 0:
                self.stdout.write(f'Processed {i}/{total} ({i*100//total}%)...')

            try:
                # Search Google Books
                book_data = search_book(work.title, work.author if work.author else None)

                if not book_data:
                    self.stdout.write(self.style.WARNING(f'  ✗ No data found for: {work.title}'))
                    skipped += 1
                    time.sleep(delay)
                    continue

                updated = False

                if dry_run:
                    self.stdout.write(f'  Would update: {work.title}')
                    if book_data.get('author') and not work.author:
                        self.stdout.write(f"    Author: {book_data['author']}")
                    if book_data.get('genre') and not work.genre:
                        self.stdout.write(f"    Genre: {book_data['genre']}")
                    enriched += 1
                else:
                    if book_data.get('author') and not work.author:
                        work.author = book_data['author']
                        updated = True

                    if book_data.get('genre') and not work.genre:
                        work.genre = book_data['genre']
                        updated = True

                    # Also update other missing fields while we're here
                    if book_data.get('description') and not work.summary:
                        work.summary = book_data['description']
                        updated = True

                    if book_data.get('year') and not work.year:
                        work.year = book_data['year']
                        updated = True

                    if book_data.get('cover_url') and not work.cover_url:
                        work.cover_url = book_data['cover_url']
                        updated = True

                    if book_data.get('average_rating') and not work.average_rating:
                        work.average_rating = book_data['average_rating']
                        updated = True

                    if book_data.get('ratings_count') and not work.ratings_count:
                        work.ratings_count = book_data['ratings_count']
                        updated = True

                    if updated:
                        work.save()
                        self.stdout.write(self.style.SUCCESS(
                            f'  ✓ {work.title} - Author: {work.author or "N/A"}, Genre: {work.genre or "N/A"}'
                        ))
                        enriched += 1
                    else:
                        skipped += 1

                # Rate limiting
                time.sleep(delay)

            except Exception as e:
                self.stderr.write(f'Failed to process {work.title}: {str(e)}')
                failed += 1
                continue

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Enriched: {enriched}'))
        self.stdout.write(f'  Skipped: {skipped}')
        if failed:
            self.stdout.write(self.style.ERROR(f'  Failed: {failed}'))

        self.stdout.write('\n' + self.style.SUCCESS('Book metadata enrichment complete!'))
