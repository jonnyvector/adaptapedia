"""Management command to add Jaws to reach 300 books."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


BOOK = {"title": "Jaws", "author": "Peter Benchley", "year": 1974, "adaptations": [{"title": "Jaws", "year": 1975, "type": "MOVIE"}]}


class Command(BaseCommand):
    help = 'Add Jaws to reach 300 books'

    def add_arguments(self, parser):
        parser.add_argument(
            '--execute',
            action='store_true',
            help='Actually add the book (default is dry-run)',
        )

    def handle(self, *args, **options):
        execute = options.get('execute')

        self.stdout.write(f'\n{"="*80}')
        self.stdout.write(f'Adding: {BOOK["title"]} by {BOOK["author"]}')
        self.stdout.write(f'{"="*80}\n')

        try:
            # Check if book already exists
            existing = Work.objects.filter(title__iexact=BOOK['title']).first()
            if existing:
                self.stdout.write(self.style.WARNING(f'Book already exists (ID: {existing.id})'))
                return

            # Search Google Books
            google_data = search_book(BOOK['title'], BOOK['author'])

            if not google_data:
                self.stdout.write(self.style.ERROR(f'Not found on Google Books'))
                return

            self.stdout.write(f'✓ Found on Google Books')
            self.stdout.write(f'  Cover: {google_data.get("cover_url", "None")[:60]}...')

            if execute:
                work = Work.objects.create(
                    title=google_data['title'],
                    author=google_data.get('author'),
                    year=google_data.get('year') or BOOK.get('year'),
                    summary=google_data.get('description', ''),
                    cover_url=google_data.get('cover_url'),
                    language=google_data.get('language'),
                    genre=google_data.get('genre'),
                    average_rating=google_data.get('average_rating'),
                    ratings_count=google_data.get('ratings_count'),
                )
                self.stdout.write(self.style.SUCCESS(f'✓ Created Work (ID: {work.id})'))

                # Process adaptation
                adapt = BOOK['adaptations'][0]
                self.stdout.write(f'\nProcessing adaptation: {adapt["title"]} ({adapt["year"]})')

                # Check if adaptation already exists
                existing_screen = ScreenWork.objects.filter(
                    title__iexact=adapt['title'],
                    year=adapt['year']
                ).first()

                if existing_screen:
                    self.stdout.write(self.style.WARNING(f'  Adaptation already exists (ID: {existing_screen.id})'))
                    # Create edge
                    edge, created = AdaptationEdge.objects.get_or_create(
                        work=work,
                        screen_work=existing_screen,
                        defaults={'source': 'MANUAL'}
                    )
                    if created:
                        self.stdout.write(f'  ✓ Created adaptation edge')
                else:
                    # Search TMDb
                    tmdb_data = self.search_tmdb(adapt['title'], adapt['year'], adapt['type'])

                    if not tmdb_data:
                        self.stdout.write(self.style.ERROR(f'  Not found on TMDb'))
                        return

                    self.stdout.write(f'  ✓ Found on TMDb')
                    self.stdout.write(f'    Poster: {tmdb_data.get("poster", "None")[:50]}...')

                    screen_work = ScreenWork.objects.create(
                        title=tmdb_data['title'],
                        year=tmdb_data['year'],
                        type=adapt['type'],
                        summary=tmdb_data.get('summary', ''),
                        poster_url=tmdb_data.get('poster'),
                        backdrop_path=tmdb_data.get('backdrop'),
                        tmdb_id=tmdb_data.get('tmdb_id'),
                    )
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created ScreenWork (ID: {screen_work.id})'))

                    # Create adaptation edge
                    AdaptationEdge.objects.create(
                        work=work,
                        screen_work=screen_work,
                        source='MANUAL'
                    )
                    self.stdout.write(f'  ✓ Created adaptation edge')

                self.stdout.write(self.style.SUCCESS(f'\n✅ SUCCESS! Added Jaws'))
            else:
                self.stdout.write(f'\n→ Would create Work and adaptation')
                self.stdout.write(self.style.WARNING('\nThis was a DRY RUN. Use --execute to add the book.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))

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
