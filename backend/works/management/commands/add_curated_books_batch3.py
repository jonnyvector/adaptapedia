"""Management command to add third batch of 50 curated books and their adaptations."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


# List of 50 curated books with their adaptations (Batch 3)
CURATED_BOOKS = [
    # Romance/Drama (Nicholas Sparks)
    {"title": "A Walk to Remember", "author": "Nicholas Sparks", "year": 1999, "adaptations": [{"title": "A Walk to Remember", "year": 2002, "type": "MOVIE"}]},
    {"title": "Dear John", "author": "Nicholas Sparks", "year": 2006, "adaptations": [{"title": "Dear John", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Last Song", "author": "Nicholas Sparks", "year": 2009, "adaptations": [{"title": "The Last Song", "year": 2010, "type": "MOVIE"}]},
    {"title": "Safe Haven", "author": "Nicholas Sparks", "year": 2010, "adaptations": [{"title": "Safe Haven", "year": 2013, "type": "MOVIE"}]},
    {"title": "The Lucky One", "author": "Nicholas Sparks", "year": 2008, "adaptations": [{"title": "The Lucky One", "year": 2012, "type": "MOVIE"}]},
    {"title": "P.S. I Love You", "author": "Cecelia Ahern", "year": 2004, "adaptations": [{"title": "P.S. I Love You", "year": 2007, "type": "MOVIE"}]},
    {"title": "The Vow", "author": "Kim Carpenter", "year": 2010, "adaptations": [{"title": "The Vow", "year": 2012, "type": "MOVIE"}]},
    {"title": "One Day", "author": "David Nicholls", "year": 2009, "adaptations": [{"title": "One Day", "year": 2011, "type": "MOVIE"}]},
    {"title": "The Light Between Oceans", "author": "M.L. Stedman", "year": 2012, "adaptations": [{"title": "The Light Between Oceans", "year": 2016, "type": "MOVIE"}]},
    {"title": "Still Alice", "author": "Lisa Genova", "year": 2007, "adaptations": [{"title": "Still Alice", "year": 2014, "type": "MOVIE"}]},

    # Action/Thriller (Tom Clancy)
    {"title": "The Hunt for Red October", "author": "Tom Clancy", "year": 1984, "adaptations": [{"title": "The Hunt for Red October", "year": 1990, "type": "MOVIE"}]},
    {"title": "Patriot Games", "author": "Tom Clancy", "year": 1987, "adaptations": [{"title": "Patriot Games", "year": 1992, "type": "MOVIE"}]},
    {"title": "Clear and Present Danger", "author": "Tom Clancy", "year": 1989, "adaptations": [{"title": "Clear and Present Danger", "year": 1994, "type": "MOVIE"}]},
    {"title": "The Sum of All Fears", "author": "Tom Clancy", "year": 1991, "adaptations": [{"title": "The Sum of All Fears", "year": 2002, "type": "MOVIE"}]},
    {"title": "Killing Floor", "author": "Lee Child", "year": 1997, "adaptations": [{"title": "Jack Reacher", "year": 2012, "type": "MOVIE"}]},
    {"title": "The Bourne Supremacy", "author": "Robert Ludlum", "year": 1986, "adaptations": [{"title": "The Bourne Supremacy", "year": 2004, "type": "MOVIE"}]},
    {"title": "The Bourne Ultimatum", "author": "Robert Ludlum", "year": 1990, "adaptations": [{"title": "The Bourne Ultimatum", "year": 2007, "type": "MOVIE"}]},
    {"title": "The Day of the Jackal", "author": "Frederick Forsyth", "year": 1971, "adaptations": [{"title": "The Day of the Jackal", "year": 1973, "type": "MOVIE"}]},
    {"title": "Red Dragon", "author": "Thomas Harris", "year": 1981, "adaptations": [{"title": "Red Dragon", "year": 2002, "type": "MOVIE"}]},
    {"title": "Hannibal", "author": "Thomas Harris", "year": 1999, "adaptations": [{"title": "Hannibal", "year": 2001, "type": "MOVIE"}]},

    # Classic Literature
    {"title": "The Old Man and the Sea", "author": "Ernest Hemingway", "year": 1952, "adaptations": [{"title": "The Old Man and the Sea", "year": 1958, "type": "MOVIE"}]},
    {"title": "For Whom the Bell Tolls", "author": "Ernest Hemingway", "year": 1940, "adaptations": [{"title": "For Whom the Bell Tolls", "year": 1943, "type": "MOVIE"}]},
    {"title": "Moby-Dick", "author": "Herman Melville", "year": 1851, "adaptations": [{"title": "Moby Dick", "year": 1956, "type": "MOVIE"}]},
    {"title": "Sense and Sensibility", "author": "Jane Austen", "year": 1811, "adaptations": [{"title": "Sense and Sensibility", "year": 1995, "type": "MOVIE"}]},
    {"title": "Emma", "author": "Jane Austen", "year": 1815, "adaptations": [{"title": "Emma", "year": 2020, "type": "MOVIE"}]},
    {"title": "Les Misérables", "author": "Victor Hugo", "year": 1862, "adaptations": [{"title": "Les Misérables", "year": 2012, "type": "MOVIE"}]},
    {"title": "The Hunchback of Notre-Dame", "author": "Victor Hugo", "year": 1831, "adaptations": [{"title": "The Hunchback of Notre Dame", "year": 1996, "type": "MOVIE"}]},
    {"title": "The Jungle Book", "author": "Rudyard Kipling", "year": 1894, "adaptations": [{"title": "The Jungle Book", "year": 2016, "type": "MOVIE"}]},

    # War & Historical
    {"title": "All Quiet on the Western Front", "author": "Erich Maria Remarque", "year": 1929, "adaptations": [{"title": "All Quiet on the Western Front", "year": 1930, "type": "MOVIE"}, {"title": "All Quiet on the Western Front", "year": 2022, "type": "MOVIE"}]},
    {"title": "The Thin Red Line", "author": "James Jones", "year": 1962, "adaptations": [{"title": "The Thin Red Line", "year": 1998, "type": "MOVIE"}]},
    {"title": "Black Hawk Down", "author": "Mark Bowden", "year": 1999, "adaptations": [{"title": "Black Hawk Down", "year": 2001, "type": "MOVIE"}]},
    {"title": "Lone Survivor", "author": "Marcus Luttrell", "year": 2007, "adaptations": [{"title": "Lone Survivor", "year": 2013, "type": "MOVIE"}]},
    {"title": "American Sniper", "author": "Chris Kyle", "year": 2012, "adaptations": [{"title": "American Sniper", "year": 2014, "type": "MOVIE"}]},

    # Horror/Supernatural
    {"title": "The Omen", "author": "David Seltzer", "year": 1976, "adaptations": [{"title": "The Omen", "year": 1976, "type": "MOVIE"}, {"title": "The Omen", "year": 2006, "type": "MOVIE"}]},
    {"title": "Hell House", "author": "Richard Matheson", "year": 1971, "adaptations": [{"title": "The Legend of Hell House", "year": 1973, "type": "MOVIE"}]},
    {"title": "The Legend of Sleepy Hollow", "author": "Washington Irving", "year": 1820, "adaptations": [{"title": "Sleepy Hollow", "year": 1999, "type": "MOVIE"}]},

    # Biographies & True Stories
    {"title": "The Accidental Billionaires", "author": "Ben Mezrich", "year": 2009, "adaptations": [{"title": "The Social Network", "year": 2010, "type": "MOVIE"}]},
    {"title": "Moneyball", "author": "Michael Lewis", "year": 2003, "adaptations": [{"title": "Moneyball", "year": 2011, "type": "MOVIE"}]},
    {"title": "The Blind Side", "author": "Michael Lewis", "year": 2006, "adaptations": [{"title": "The Blind Side", "year": 2009, "type": "MOVIE"}]},
    {"title": "Between a Rock and a Hard Place", "author": "Aron Ralston", "year": 2004, "adaptations": [{"title": "127 Hours", "year": 2010, "type": "MOVIE"}]},
    {"title": "Travelling to Infinity", "author": "Jane Hawking", "year": 2007, "adaptations": [{"title": "The Theory of Everything", "year": 2014, "type": "MOVIE"}]},
    {"title": "Hidden Figures", "author": "Margot Lee Shetterly", "year": 2016, "adaptations": [{"title": "Hidden Figures", "year": 2016, "type": "MOVIE"}]},

    # Comic Books/Graphic Novels
    {"title": "Road to Perdition", "author": "Max Allan Collins", "year": 1998, "adaptations": [{"title": "Road to Perdition", "year": 2002, "type": "MOVIE"}]},
    {"title": "A History of Violence", "author": "John Wagner", "year": 1997, "adaptations": [{"title": "A History of Violence", "year": 2005, "type": "MOVIE"}]},
    {"title": "The Walking Dead", "author": "Robert Kirkman", "year": 2003, "adaptations": [{"title": "The Walking Dead", "year": 2010, "type": "TV"}]},
    {"title": "Hellboy: Seed of Destruction", "author": "Mike Mignola", "year": 1994, "adaptations": [{"title": "Hellboy", "year": 2004, "type": "MOVIE"}]},
    {"title": "Hellblazer", "author": "Jamie Delano", "year": 1988, "adaptations": [{"title": "Constantine", "year": 2005, "type": "MOVIE"}]},
    {"title": "The Crow", "author": "James O'Barr", "year": 1989, "adaptations": [{"title": "The Crow", "year": 1994, "type": "MOVIE"}]},

    # YA
    {"title": "The Spectacular Now", "author": "Tim Tharp", "year": 2008, "adaptations": [{"title": "The Spectacular Now", "year": 2013, "type": "MOVIE"}]},
    {"title": "Angus, Thongs and Full-Frontal Snogging", "author": "Louise Rennison", "year": 1999, "adaptations": [{"title": "Angus, Thongs and Perfect Snogging", "year": 2008, "type": "MOVIE"}]},
]


class Command(BaseCommand):
    help = 'Add third batch of 50 curated books and their adaptations'

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
        self.stdout.write(f'Processing {len(CURATED_BOOKS)} books (Batch 3)...')
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
            self.stdout.write(self.style.WARNING('  python manage.py add_curated_books_batch3 --execute'))

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
