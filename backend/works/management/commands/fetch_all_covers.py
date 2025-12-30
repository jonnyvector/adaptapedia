"""Management command to batch fetch book covers and screen posters."""
import requests
import time
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from screen.models import ScreenWork


class Command(BaseCommand):
    """Batch fetch book covers from Open Library and screen posters from TMDb."""

    help = 'Batch fetch book covers from Open Library and screen posters from TMDb'

    def add_arguments(self, parser):
        parser.add_argument(
            '--books',
            action='store_true',
            help='Fetch book covers only',
        )
        parser.add_argument(
            '--screens',
            action='store_true',
            help='Fetch screen posters only',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be fetched without saving',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        fetch_books = options['books']
        fetch_screens = options['screens']

        # If neither specified, fetch both
        if not fetch_books and not fetch_screens:
            fetch_books = True
            fetch_screens = True

        if fetch_books:
            self.stdout.write(self.style.WARNING('\n📚 Fetching Book Covers from Open Library...'))
            self.fetch_book_covers(dry_run)

        if fetch_screens:
            self.stdout.write(self.style.WARNING('\n🎬 Fetching Screen Posters from TMDb...'))
            self.fetch_screen_posters(dry_run)

    def fetch_book_covers(self, dry_run=False):
        """Fetch book covers from Open Library API."""
        books_missing = Work.objects.filter(cover_url__isnull=True) | Work.objects.filter(cover_url='')
        total = books_missing.count()

        self.stdout.write(f'Found {total} books without covers\n')

        success_count = 0
        fail_count = 0

        for i, book in enumerate(books_missing, 1):
            # Search Open Library by title
            try:
                # Try to find book by title
                search_url = 'https://openlibrary.org/search.json'
                params = {
                    'title': book.title,
                    'limit': 1
                }

                response = requests.get(search_url, params=params, timeout=10)

                if response.status_code == 200:
                    data = response.json()

                    if data.get('docs') and len(data['docs']) > 0:
                        doc = data['docs'][0]

                        # Try to get cover ID
                        cover_id = doc.get('cover_i')
                        if cover_id:
                            cover_url = f'https://covers.openlibrary.org/b/id/{cover_id}-L.jpg'

                            if dry_run:
                                self.stdout.write(
                                    f'[{i}/{total}] Would set: {book.title} ({book.year})\n'
                                    f'           URL: {cover_url}'
                                )
                            else:
                                book.cover_url = cover_url
                                book.save()
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f'[{i}/{total}] ✓ {book.title} ({book.year})'
                                    )
                                )
                            success_count += 1
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'[{i}/{total}] ✗ No cover found: {book.title} ({book.year})'
                                )
                            )
                            fail_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'[{i}/{total}] ✗ Not found: {book.title} ({book.year})'
                            )
                        )
                        fail_count += 1
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f'[{i}/{total}] ✗ API error: {book.title}'
                        )
                    )
                    fail_count += 1

                # Rate limiting
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'[{i}/{total}] ✗ Error fetching {book.title}: {str(e)}'
                    )
                )
                fail_count += 1

        self.stdout.write(
            f'\n📚 Book Covers Summary: {success_count} found, {fail_count} not found'
        )

    def fetch_screen_posters(self, dry_run=False):
        """Fetch screen posters from TMDb API."""
        screens_missing = ScreenWork.objects.filter(poster_url__isnull=True) | ScreenWork.objects.filter(poster_url='')
        total = screens_missing.count()

        self.stdout.write(f'Found {total} screens without posters\n')

        # Check if TMDb API key is configured
        tmdb_api_key = getattr(settings, 'TMDB_API_KEY', None)
        if not tmdb_api_key:
            self.stdout.write(
                self.style.ERROR(
                    'TMDB_API_KEY not configured in settings. Cannot fetch posters.'
                )
            )
            return

        success_count = 0
        fail_count = 0

        for i, screen in enumerate(screens_missing, 1):
            # If we already have tmdb_id, use it directly
            if screen.tmdb_id:
                try:
                    if screen.type == 'MOVIE':
                        url = f'https://api.themoviedb.org/3/movie/{screen.tmdb_id}'
                    else:
                        url = f'https://api.themoviedb.org/3/tv/{screen.tmdb_id}'

                    params = {'api_key': tmdb_api_key}
                    response = requests.get(url, params=params, timeout=10)

                    if response.status_code == 200:
                        data = response.json()
                        poster_path = data.get('poster_path')

                        if poster_path:
                            poster_url = f'https://image.tmdb.org/t/p/w500{poster_path}'

                            if dry_run:
                                self.stdout.write(
                                    f'[{i}/{total}] Would set: {screen.title} ({screen.year})\n'
                                    f'           URL: {poster_url}'
                                )
                            else:
                                screen.poster_url = poster_url
                                screen.save()
                                self.stdout.write(
                                    self.style.SUCCESS(
                                        f'[{i}/{total}] ✓ {screen.title} ({screen.year})'
                                    )
                                )
                            success_count += 1
                        else:
                            self.stdout.write(
                                self.style.WARNING(
                                    f'[{i}/{total}] ✗ No poster: {screen.title} ({screen.year})'
                                )
                            )
                            fail_count += 1
                    else:
                        self.stdout.write(
                            self.style.WARNING(
                                f'[{i}/{total}] ✗ Not found: {screen.title} ({screen.year})'
                            )
                        )
                        fail_count += 1

                    time.sleep(0.25)

                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(
                            f'[{i}/{total}] ✗ Error: {screen.title}: {str(e)}'
                        )
                    )
                    fail_count += 1
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'[{i}/{total}] ⊘ No TMDb ID: {screen.title} ({screen.year})'
                    )
                )
                fail_count += 1

        self.stdout.write(
            f'\n🎬 Screen Posters Summary: {success_count} found, {fail_count} not found'
        )
