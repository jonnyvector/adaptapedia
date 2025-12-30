"""Management command to add fifth batch of 12 curated books and their adaptations."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


# List of 12 curated books with their adaptations (Batch 5)
CURATED_BOOKS = [
    {"title": "Cloud Atlas", "author": "David Mitchell", "year": 2004, "adaptations": [{"title": "Cloud Atlas", "year": 2012, "type": "MOVIE"}]},
    {"title": "The Color Purple", "author": "Alice Walker", "year": 1982, "adaptations": [{"title": "The Color Purple", "year": 1985, "type": "MOVIE"}]},
    {"title": "Beloved", "author": "Toni Morrison", "year": 1987, "adaptations": [{"title": "Beloved", "year": 1998, "type": "MOVIE"}]},
    {"title": "Schindler's Ark", "author": "Thomas Keneally", "year": 1982, "adaptations": [{"title": "Schindler's List", "year": 1993, "type": "MOVIE"}]},
    {"title": "Twelve Years a Slave", "author": "Solomon Northup", "year": 1853, "adaptations": [{"title": "12 Years a Slave", "year": 2013, "type": "MOVIE"}]},
    {"title": "The Reader", "author": "Bernhard Schlink", "year": 1995, "adaptations": [{"title": "The Reader", "year": 2008, "type": "MOVIE"}]},
    {"title": "Fried Green Tomatoes at the Whistle Stop Cafe", "author": "Fannie Flagg", "year": 1987, "adaptations": [{"title": "Fried Green Tomatoes", "year": 1991, "type": "MOVIE"}]},
    {"title": "Midnight in the Garden of Good and Evil", "author": "John Berendt", "year": 1994, "adaptations": [{"title": "Midnight in the Garden of Good and Evil", "year": 1997, "type": "MOVIE"}]},
    {"title": "A Captain's Duty", "author": "Richard Phillips", "year": 2010, "adaptations": [{"title": "Captain Phillips", "year": 2013, "type": "MOVIE"}]},
    {"title": "Alan Turing: The Enigma", "author": "Andrew Hodges", "year": 1983, "adaptations": [{"title": "The Imitation Game", "year": 2014, "type": "MOVIE"}]},
    {"title": "A Beautiful Mind", "author": "Sylvia Nasar", "year": 1998, "adaptations": [{"title": "A Beautiful Mind", "year": 2001, "type": "MOVIE"}]},
    {"title": "Lonesome Dove", "author": "Larry McMurtry", "year": 1985, "adaptations": [{"title": "Lonesome Dove", "year": 1989, "type": "TV"}]},
]


class Command(BaseCommand):
    help = 'Add fifth batch of 12 curated books and their adaptations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--execute',
            action='store_true',
            help='Actually add the books (default is dry-run)',
        )

    def handle(self, *args, **options):
        execute = options.get('execute')

        stats = {
            'books_found': 0,
            'books_created': 0,
            'books_skipped': 0,
            'adaptations_found': 0,
            'adaptations_created': 0,
            'adaptations_skipped': 0,
            'errors': 0,
        }

        self.stdout.write(f'\n{"="*80}')
        self.stdout.write(f'Processing {len(CURATED_BOOKS)} books (Batch 5)...')
        self.stdout.write(f'{"="*80}\n')

        for i, book_data in enumerate(CURATED_BOOKS, 1):
            self.stdout.write(f'\n[{i}/{len(CURATED_BOOKS)}] {book_data["title"]} by {book_data.get("author", "Unknown")}')

            try:
                # Check if book already exists
                existing = Work.objects.filter(title__iexact=book_data['title']).first()
                if existing:
                    self.stdout.write(self.style.WARNING(f'  ⊘ Book already exists (ID: {existing.id})'))
                    stats['books_skipped'] += 1
                    work = existing
                else:
                    # Search Google Books
                    google_data = search_book(book_data['title'], book_data.get('author'))

                    if not google_data:
                        self.stdout.write(self.style.ERROR(f'  ✗ Not found on Google Books'))
                        stats['errors'] += 1
                        continue

                    stats['books_found'] += 1
                    self.stdout.write(f'  ✓ Found on Google Books')
                    self.stdout.write(f'    Cover: {google_data.get("cover_url", "None")[:60]}...')

                    if execute:
                        work = Work.objects.create(
                            title=google_data['title'],
                            author=google_data.get('author'),
                            year=google_data.get('year') or book_data.get('year'),
                            summary=google_data.get('description', ''),
                            cover_url=google_data.get('cover_url'),
                            language=google_data.get('language'),
                            genre=google_data.get('genre'),
                            average_rating=google_data.get('average_rating'),
                            ratings_count=google_data.get('ratings_count'),
                        )
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Created Work (ID: {work.id})'))
                        stats['books_created'] += 1
                    else:
                        self.stdout.write(f'  → Would create Work')

                # Process adaptations
                for adapt in book_data.get('adaptations', []):
                    self.stdout.write(f'\n    Processing adaptation: {adapt["title"]} ({adapt["year"]})')

                    # Check if adaptation already exists
                    if execute or existing:
                        existing_screen = ScreenWork.objects.filter(
                            title__iexact=adapt['title'],
                            year=adapt['year']
                        ).first()

                        if existing_screen:
                            self.stdout.write(self.style.WARNING(f'      ⊘ Adaptation already exists (ID: {existing_screen.id})'))
                            stats['adaptations_skipped'] += 1

                            # Create edge if needed
                            if execute and work:
                                edge, created = AdaptationEdge.objects.get_or_create(
                                    work=work,
                                    screen_work=existing_screen,
                                    defaults={'source': 'MANUAL'}
                                )
                                if created:
                                    self.stdout.write(f'      ✓ Created adaptation edge')
                            continue

                    # Search TMDb
                    tmdb_data = self.search_tmdb(adapt['title'], adapt['year'], adapt['type'])

                    if not tmdb_data:
                        self.stdout.write(self.style.ERROR(f'      ✗ Not found on TMDb'))
                        stats['errors'] += 1
                        continue

                    stats['adaptations_found'] += 1
                    self.stdout.write(f'      ✓ Found on TMDb')
                    self.stdout.write(f'        Poster: {tmdb_data.get("poster", "None")[:50]}...')

                    if execute:
                        screen_work = ScreenWork.objects.create(
                            title=tmdb_data['title'],
                            year=tmdb_data['year'],
                            type=adapt['type'],
                            summary=tmdb_data.get('summary', ''),
                            poster_url=tmdb_data.get('poster'),
                            backdrop_path=tmdb_data.get('backdrop'),
                            tmdb_id=tmdb_data.get('tmdb_id'),
                        )
                        self.stdout.write(self.style.SUCCESS(f'      ✓ Created ScreenWork (ID: {screen_work.id})'))
                        stats['adaptations_created'] += 1

                        # Create adaptation edge
                        AdaptationEdge.objects.create(
                            work=work,
                            screen_work=screen_work,
                            source='MANUAL'
                        )
                        self.stdout.write(f'      ✓ Created adaptation edge')
                    else:
                        self.stdout.write(f'      → Would create ScreenWork and edge')

                # Rate limit
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ✗ Error: {str(e)}'))
                stats['errors'] += 1

        # Summary
        self.stdout.write(f'\n{"="*80}')
        self.stdout.write('SUMMARY')
        self.stdout.write(f'{"="*80}')
        self.stdout.write(f'Books found on Google Books: {stats["books_found"]}')
        self.stdout.write(f'Books created: {stats["books_created"]}')
        self.stdout.write(f'Books skipped (already exist): {stats["books_skipped"]}')
        self.stdout.write(f'Adaptations found on TMDb: {stats["adaptations_found"]}')
        self.stdout.write(f'Adaptations created: {stats["adaptations_created"]}')
        self.stdout.write(f'Adaptations skipped (already exist): {stats["adaptations_skipped"]}')
        self.stdout.write(f'Errors: {stats["errors"]}')

        if not execute:
            self.stdout.write(f'\n{"-"*80}')
            self.stdout.write(self.style.WARNING('This was a DRY RUN. No books were added.'))
            self.stdout.write(self.style.WARNING('To actually add these books, run:'))
            self.stdout.write(self.style.WARNING('  python manage.py add_curated_books_batch5 --execute'))

    def search_tmdb(self, title, year, media_type):
        """Search TMDb for a movie or TV show."""
        if not settings.TMDB_API_KEY:
            return None

        search_type = 'movie' if media_type == 'MOVIE' else 'tv'
        url = f'https://api.themoviedb.org/3/search/{search_type}'

        params = {
            'api_key': settings.TMDB_API_KEY,
            'query': title,
        }

        if year:
            if search_type == 'movie':
                params['year'] = year
            else:
                params['first_air_date_year'] = year

        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if not data.get('results'):
                return None

            result = data['results'][0]

            # Get poster
            poster = None
            if result.get('poster_path'):
                poster = f'https://image.tmdb.org/t/p/w500{result["poster_path"]}'

            # Get backdrop
            backdrop = None
            if result.get('backdrop_path'):
                backdrop = f'https://image.tmdb.org/t/p/original{result["backdrop_path"]}'

            return {
                'title': result.get('title') or result.get('name'),
                'year': int((result.get('release_date') or result.get('first_air_date', '0000'))[:4]),
                'summary': result.get('overview', ''),
                'poster': poster,
                'backdrop': backdrop,
                'tmdb_id': result.get('id'),
            }

        except Exception as e:
            print(f'TMDb error: {e}')
            return None
