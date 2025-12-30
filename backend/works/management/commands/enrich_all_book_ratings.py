"""Management command to enrich books with ratings from both Google Books and Open Library."""
import time
from django.core.management.base import BaseCommand
from works.models import Work
from works.utils.google_books import search_book
from ingestion.openlibrary import enrich_work_from_openlibrary


class Command(BaseCommand):
    help = 'Enrich books with ratings from both Google Books and Open Library, using whichever has more ratings'

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
            '--force',
            action='store_true',
            help='Re-fetch ratings even if they already exist',
        )

    def handle(self, *args, **options):
        limit = options.get('limit')
        delay = options.get('delay')
        force = options.get('force')

        # Get all works
        works = Work.objects.all()

        if not force:
            # Only process books without ratings
            works = works.filter(average_rating__isnull=True) | works.filter(ratings_count__isnull=True)
            works = works.distinct()

        if limit:
            works = works[:limit]

        total = works.count()
        self.stdout.write(f'Processing {total} books...\n')

        enriched_google = 0
        enriched_openlibrary = 0
        no_ratings = 0
        failed = 0

        for i, work in enumerate(works, 1):
            if i % 10 == 0:
                self.stdout.write(f'Processed {i}/{total} ({i*100//total}%)...')

            try:
                google_rating = None
                google_count = None
                ol_rating = None
                ol_count = None

                # Fetch from Google Books
                try:
                    book_data = search_book(work.title, work.author if work.author else None)
                    if book_data:
                        google_rating = book_data.get('average_rating')
                        google_count = book_data.get('ratings_count')
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'  Google Books failed for {work.title}: {e}'))

                time.sleep(delay)

                # Fetch from Open Library (if we have an OL work ID)
                if work.openlibrary_work_id:
                    try:
                        import requests
                        from django.conf import settings

                        ratings_url = f"{settings.OPEN_LIBRARY_BASE_URL}{work.openlibrary_work_id}/ratings.json"
                        ratings_response = requests.get(ratings_url, timeout=10)
                        ratings_response.raise_for_status()
                        ratings_data = ratings_response.json()

                        if 'summary' in ratings_data:
                            ol_rating = ratings_data['summary'].get('average')
                            ol_count = ratings_data['summary'].get('count')
                    except Exception as e:
                        pass  # Silent fail for OL ratings

                    time.sleep(delay)

                # Choose which rating to use (whichever has more ratings)
                chosen_source = None
                if google_rating and google_count and ol_rating and ol_count:
                    if ol_count > google_count:
                        work.average_rating = ol_rating
                        work.ratings_count = ol_count
                        chosen_source = 'Open Library'
                        enriched_openlibrary += 1
                    else:
                        work.average_rating = google_rating
                        work.ratings_count = google_count
                        chosen_source = 'Google Books'
                        enriched_google += 1
                elif ol_rating and ol_count:
                    work.average_rating = ol_rating
                    work.ratings_count = ol_count
                    chosen_source = 'Open Library'
                    enriched_openlibrary += 1
                elif google_rating and google_count:
                    work.average_rating = google_rating
                    work.ratings_count = google_count
                    chosen_source = 'Google Books'
                    enriched_google += 1
                else:
                    no_ratings += 1

                if chosen_source:
                    work.save()
                    self.stdout.write(self.style.SUCCESS(
                        f'  ✓ {work.title} - {chosen_source}: ⭐ {work.average_rating:.1f} ({work.ratings_count} ratings)'
                    ))
                else:
                    self.stdout.write(self.style.WARNING(f'  ✗ {work.title} - No ratings found'))

            except Exception as e:
                self.stderr.write(f'Failed to process {work.title}: {str(e)}')
                failed += 1
                continue

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Google Books ratings: {enriched_google}'))
        self.stdout.write(self.style.SUCCESS(f'  Open Library ratings: {enriched_openlibrary}'))
        self.stdout.write(f'  No ratings found: {no_ratings}')
        if failed:
            self.stdout.write(self.style.ERROR(f'  Failed: {failed}'))

        self.stdout.write('\n' + self.style.SUCCESS('Book ratings enrichment complete!'))
