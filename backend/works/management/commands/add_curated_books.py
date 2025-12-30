"""Management command to add 50 curated books and their adaptations."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


# List of 50 curated books with their adaptations
CURATED_BOOKS = [
    # Classic Literature
    {"title": "1984", "author": "George Orwell", "year": 1949, "adaptations": [{"title": "Nineteen Eighty-Four", "year": 1984, "type": "MOVIE"}]},
    {"title": "Lord of the Flies", "author": "William Golding", "year": 1954, "adaptations": [{"title": "Lord of the Flies", "year": 1963, "type": "MOVIE"}, {"title": "Lord of the Flies", "year": 1990, "type": "MOVIE"}]},
    {"title": "Animal Farm", "author": "George Orwell", "year": 1945, "adaptations": [{"title": "Animal Farm", "year": 1954, "type": "MOVIE"}]},
    {"title": "Brave New World", "author": "Aldous Huxley", "year": 1932, "adaptations": [{"title": "Brave New World", "year": 2020, "type": "TV"}]},
    {"title": "Fahrenheit 451", "author": "Ray Bradbury", "year": 1953, "adaptations": [{"title": "Fahrenheit 451", "year": 1966, "type": "MOVIE"}, {"title": "Fahrenheit 451", "year": 2018, "type": "MOVIE"}]},
    {"title": "Of Mice and Men", "author": "John Steinbeck", "year": 1937, "adaptations": [{"title": "Of Mice and Men", "year": 1992, "type": "MOVIE"}]},
    {"title": "Frankenstein", "author": "Mary Shelley", "year": 1818, "adaptations": [{"title": "Frankenstein", "year": 1931, "type": "MOVIE"}]},
    {"title": "Dracula", "author": "Bram Stoker", "year": 1897, "adaptations": [{"title": "Dracula", "year": 1931, "type": "MOVIE"}, {"title": "Bram Stoker's Dracula", "year": 1992, "type": "MOVIE"}]},
    {"title": "The Picture of Dorian Gray", "author": "Oscar Wilde", "year": 1890, "adaptations": [{"title": "The Picture of Dorian Gray", "year": 1945, "type": "MOVIE"}]},
    {"title": "Wuthering Heights", "author": "Emily Brontë", "year": 1847, "adaptations": [{"title": "Wuthering Heights", "year": 2011, "type": "MOVIE"}]},

    # Sci-Fi/Fantasy
    {"title": "A Wrinkle in Time", "author": "Madeleine L'Engle", "year": 1962, "adaptations": [{"title": "A Wrinkle in Time", "year": 2018, "type": "MOVIE"}]},
    {"title": "The Golden Compass", "author": "Philip Pullman", "year": 1995, "adaptations": [{"title": "The Golden Compass", "year": 2007, "type": "MOVIE"}, {"title": "His Dark Materials", "year": 2019, "type": "TV"}]},
    {"title": "Percy Jackson & the Olympians: The Lightning Thief", "author": "Rick Riordan", "year": 2005, "adaptations": [{"title": "Percy Jackson & the Olympians: The Lightning Thief", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Giver", "author": "Lois Lowry", "year": 1993, "adaptations": [{"title": "The Giver", "year": 2014, "type": "MOVIE"}]},
    {"title": "The Bad Beginning", "author": "Lemony Snicket", "year": 1999, "adaptations": [{"title": "Lemony Snicket's A Series of Unfortunate Events", "year": 2004, "type": "MOVIE"}]},
    {"title": "Coraline", "author": "Neil Gaiman", "year": 2002, "adaptations": [{"title": "Coraline", "year": 2009, "type": "MOVIE"}]},
    {"title": "The Spiderwick Chronicles", "author": "Tony DiTerlizzi", "year": 2003, "adaptations": [{"title": "The Spiderwick Chronicles", "year": 2008, "type": "MOVIE"}]},
    {"title": "Bridge to Terabithia", "author": "Katherine Paterson", "year": 1977, "adaptations": [{"title": "Bridge to Terabithia", "year": 2007, "type": "MOVIE"}]},
    {"title": "Eragon", "author": "Christopher Paolini", "year": 2002, "adaptations": [{"title": "Eragon", "year": 2006, "type": "MOVIE"}]},
    {"title": "Artemis Fowl", "author": "Eoin Colfer", "year": 2001, "adaptations": [{"title": "Artemis Fowl", "year": 2020, "type": "MOVIE"}]},

    # Thriller/Mystery
    {"title": "Shutter Island", "author": "Dennis Lehane", "year": 2003, "adaptations": [{"title": "Shutter Island", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Girl on the Train", "author": "Paula Hawkins", "year": 2015, "adaptations": [{"title": "The Girl on the Train", "year": 2016, "type": "MOVIE"}]},
    {"title": "Sharp Objects", "author": "Gillian Flynn", "year": 2006, "adaptations": [{"title": "Sharp Objects", "year": 2018, "type": "TV"}]},
    {"title": "Mystic River", "author": "Dennis Lehane", "year": 2001, "adaptations": [{"title": "Mystic River", "year": 2003, "type": "MOVIE"}]},
    {"title": "The Bourne Identity", "author": "Robert Ludlum", "year": 1980, "adaptations": [{"title": "The Bourne Identity", "year": 2002, "type": "MOVIE"}]},
    {"title": "The Lincoln Lawyer", "author": "Michael Connelly", "year": 2005, "adaptations": [{"title": "The Lincoln Lawyer", "year": 2011, "type": "MOVIE"}]},
    {"title": "Presumed Innocent", "author": "Scott Turow", "year": 1987, "adaptations": [{"title": "Presumed Innocent", "year": 1990, "type": "MOVIE"}]},
    {"title": "In Cold Blood", "author": "Truman Capote", "year": 1966, "adaptations": [{"title": "In Cold Blood", "year": 1967, "type": "MOVIE"}]},
    {"title": "The Talented Mr. Ripley", "author": "Patricia Highsmith", "year": 1955, "adaptations": [{"title": "The Talented Mr. Ripley", "year": 1999, "type": "MOVIE"}]},
    {"title": "No Country for Old Men", "author": "Cormac McCarthy", "year": 2005, "adaptations": [{"title": "No Country for Old Men", "year": 2007, "type": "MOVIE"}]},

    # Drama/Literary
    {"title": "The Notebook", "author": "Nicholas Sparks", "year": 1996, "adaptations": [{"title": "The Notebook", "year": 2004, "type": "MOVIE"}]},
    {"title": "The Kite Runner", "author": "Khaled Hosseini", "year": 2003, "adaptations": [{"title": "The Kite Runner", "year": 2007, "type": "MOVIE"}]},
    {"title": "Q & A", "author": "Vikas Swarup", "year": 2005, "adaptations": [{"title": "Slumdog Millionaire", "year": 2008, "type": "MOVIE"}]},
    {"title": "Atonement", "author": "Ian McEwan", "year": 2001, "adaptations": [{"title": "Atonement", "year": 2007, "type": "MOVIE"}]},
    {"title": "Brooklyn", "author": "Colm Tóibín", "year": 2009, "adaptations": [{"title": "Brooklyn", "year": 2015, "type": "MOVIE"}]},
    {"title": "Room", "author": "Emma Donoghue", "year": 2010, "adaptations": [{"title": "Room", "year": 2015, "type": "MOVIE"}]},
    {"title": "The Curious Case of Benjamin Button", "author": "F. Scott Fitzgerald", "year": 1922, "adaptations": [{"title": "The Curious Case of Benjamin Button", "year": 2008, "type": "MOVIE"}]},
    {"title": "Memoirs of a Geisha", "author": "Arthur Golden", "year": 1997, "adaptations": [{"title": "Memoirs of a Geisha", "year": 2005, "type": "MOVIE"}]},
    {"title": "The Time Traveler's Wife", "author": "Audrey Niffenegger", "year": 2003, "adaptations": [{"title": "The Time Traveler's Wife", "year": 2009, "type": "MOVIE"}]},
    {"title": "Water for Elephants", "author": "Sara Gruen", "year": 2006, "adaptations": [{"title": "Water for Elephants", "year": 2011, "type": "MOVIE"}]},

    # Horror/Suspense
    {"title": "The Exorcist", "author": "William Peter Blatty", "year": 1971, "adaptations": [{"title": "The Exorcist", "year": 1973, "type": "MOVIE"}]},
    {"title": "Rosemary's Baby", "author": "Ira Levin", "year": 1967, "adaptations": [{"title": "Rosemary's Baby", "year": 1968, "type": "MOVIE"}]},
    {"title": "Interview with the Vampire", "author": "Anne Rice", "year": 1976, "adaptations": [{"title": "Interview with the Vampire", "year": 1994, "type": "MOVIE"}]},
    {"title": "World War Z", "author": "Max Brooks", "year": 2006, "adaptations": [{"title": "World War Z", "year": 2013, "type": "MOVIE"}]},
    {"title": "I Am Legend", "author": "Richard Matheson", "year": 1954, "adaptations": [{"title": "I Am Legend", "year": 2007, "type": "MOVIE"}]},
    {"title": "Bird Box", "author": "Josh Malerman", "year": 2014, "adaptations": [{"title": "Bird Box", "year": 2018, "type": "MOVIE"}]},

    # Children's/YA
    {"title": "Holes", "author": "Louis Sachar", "year": 1998, "adaptations": [{"title": "Holes", "year": 2003, "type": "MOVIE"}]},
    {"title": "Charlie and the Chocolate Factory", "author": "Roald Dahl", "year": 1964, "adaptations": [{"title": "Willy Wonka & the Chocolate Factory", "year": 1971, "type": "MOVIE"}, {"title": "Charlie and the Chocolate Factory", "year": 2005, "type": "MOVIE"}]},
    {"title": "Matilda", "author": "Roald Dahl", "year": 1988, "adaptations": [{"title": "Matilda", "year": 1996, "type": "MOVIE"}]},
    {"title": "The BFG", "author": "Roald Dahl", "year": 1982, "adaptations": [{"title": "The BFG", "year": 2016, "type": "MOVIE"}]},
]


class Command(BaseCommand):
    help = 'Add 50 curated books and their adaptations'

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
        self.stdout.write(f'Processing {len(CURATED_BOOKS)} books...')
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
            self.stdout.write(self.style.WARNING('  python manage.py add_curated_books --execute'))

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
