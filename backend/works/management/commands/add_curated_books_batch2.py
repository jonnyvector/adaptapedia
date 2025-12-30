"""Management command to add second batch of 50 curated books and their adaptations."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


# List of 50 curated books with their adaptations (Batch 2)
CURATED_BOOKS = [
    # Recent Bestsellers
    {"title": "The Devil Wears Prada", "author": "Lauren Weisberger", "year": 2003, "adaptations": [{"title": "The Devil Wears Prada", "year": 2006, "type": "MOVIE"}]},
    {"title": "Crazy Rich Asians", "author": "Kevin Kwan", "year": 2013, "adaptations": [{"title": "Crazy Rich Asians", "year": 2018, "type": "MOVIE"}]},
    {"title": "The Hate U Give", "author": "Angie Thomas", "year": 2017, "adaptations": [{"title": "The Hate U Give", "year": 2018, "type": "MOVIE"}]},
    {"title": "Me Before You", "author": "Jojo Moyes", "year": 2012, "adaptations": [{"title": "Me Before You", "year": 2016, "type": "MOVIE"}]},
    {"title": "Wild", "author": "Cheryl Strayed", "year": 2012, "adaptations": [{"title": "Wild", "year": 2014, "type": "MOVIE"}]},
    {"title": "Eat Pray Love", "author": "Elizabeth Gilbert", "year": 2006, "adaptations": [{"title": "Eat Pray Love", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Lovely Bones", "author": "Alice Sebold", "year": 2002, "adaptations": [{"title": "The Lovely Bones", "year": 2009, "type": "MOVIE"}]},
    {"title": "Extremely Loud & Incredibly Close", "author": "Jonathan Safran Foer", "year": 2005, "adaptations": [{"title": "Extremely Loud & Incredibly Close", "year": 2011, "type": "MOVIE"}]},
    {"title": "The Secret Life of Bees", "author": "Sue Monk Kidd", "year": 2002, "adaptations": [{"title": "The Secret Life of Bees", "year": 2008, "type": "MOVIE"}]},
    {"title": "A Man Called Ove", "author": "Fredrik Backman", "year": 2012, "adaptations": [{"title": "A Man Called Ove", "year": 2015, "type": "MOVIE"}]},

    # Classic Literature
    {"title": "Catch-22", "author": "Joseph Heller", "year": 1961, "adaptations": [{"title": "Catch-22", "year": 1970, "type": "MOVIE"}, {"title": "Catch-22", "year": 2019, "type": "TV"}]},
    {"title": "The Grapes of Wrath", "author": "John Steinbeck", "year": 1939, "adaptations": [{"title": "The Grapes of Wrath", "year": 1940, "type": "MOVIE"}]},
    {"title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "year": 1844, "adaptations": [{"title": "The Count of Monte Cristo", "year": 2002, "type": "MOVIE"}]},
    {"title": "The Three Musketeers", "author": "Alexandre Dumas", "year": 1844, "adaptations": [{"title": "The Three Musketeers", "year": 2011, "type": "MOVIE"}]},
    {"title": "Treasure Island", "author": "Robert Louis Stevenson", "year": 1883, "adaptations": [{"title": "Treasure Island", "year": 1950, "type": "MOVIE"}]},
    {"title": "Oliver Twist", "author": "Charles Dickens", "year": 1838, "adaptations": [{"title": "Oliver Twist", "year": 2005, "type": "MOVIE"}]},
    {"title": "Jane Eyre", "author": "Charlotte Brontë", "year": 1847, "adaptations": [{"title": "Jane Eyre", "year": 2011, "type": "MOVIE"}]},
    {"title": "Great Expectations", "author": "Charles Dickens", "year": 1861, "adaptations": [{"title": "Great Expectations", "year": 2012, "type": "MOVIE"}]},
    {"title": "A Christmas Carol", "author": "Charles Dickens", "year": 1843, "adaptations": [{"title": "A Christmas Carol", "year": 2009, "type": "MOVIE"}]},
    {"title": "Around the World in 80 Days", "author": "Jules Verne", "year": 1873, "adaptations": [{"title": "Around the World in 80 Days", "year": 2004, "type": "MOVIE"}]},

    # Young Adult
    {"title": "The Princess Diaries", "author": "Meg Cabot", "year": 2000, "adaptations": [{"title": "The Princess Diaries", "year": 2001, "type": "MOVIE"}]},
    {"title": "Stargirl", "author": "Jerry Spinelli", "year": 2000, "adaptations": [{"title": "Stargirl", "year": 2020, "type": "MOVIE"}]},
    {"title": "The Sisterhood of the Traveling Pants", "author": "Ann Brashares", "year": 2001, "adaptations": [{"title": "The Sisterhood of the Traveling Pants", "year": 2005, "type": "MOVIE"}]},
    {"title": "Flipped", "author": "Wendelin Van Draanen", "year": 2001, "adaptations": [{"title": "Flipped", "year": 2010, "type": "MOVIE"}]},
    {"title": "Everything, Everything", "author": "Nicola Yoon", "year": 2015, "adaptations": [{"title": "Everything, Everything", "year": 2017, "type": "MOVIE"}]},
    {"title": "Five Feet Apart", "author": "Rachael Lippincott", "year": 2018, "adaptations": [{"title": "Five Feet Apart", "year": 2019, "type": "MOVIE"}]},
    {"title": "If I Stay", "author": "Gayle Forman", "year": 2009, "adaptations": [{"title": "If I Stay", "year": 2014, "type": "MOVIE"}]},
    {"title": "Beautiful Creatures", "author": "Kami Garcia", "year": 2009, "adaptations": [{"title": "Beautiful Creatures", "year": 2013, "type": "MOVIE"}]},
    {"title": "City of Bones", "author": "Cassandra Clare", "year": 2007, "adaptations": [{"title": "The Mortal Instruments: City of Bones", "year": 2013, "type": "MOVIE"}]},
    {"title": "Cirque du Freak", "author": "Darren Shan", "year": 2000, "adaptations": [{"title": "Cirque du Freak: The Vampire's Assistant", "year": 2009, "type": "MOVIE"}]},

    # Thrillers (John Grisham)
    {"title": "The Firm", "author": "John Grisham", "year": 1991, "adaptations": [{"title": "The Firm", "year": 1993, "type": "MOVIE"}]},
    {"title": "The Client", "author": "John Grisham", "year": 1993, "adaptations": [{"title": "The Client", "year": 1994, "type": "MOVIE"}]},
    {"title": "The Pelican Brief", "author": "John Grisham", "year": 1992, "adaptations": [{"title": "The Pelican Brief", "year": 1993, "type": "MOVIE"}]},
    {"title": "A Time to Kill", "author": "John Grisham", "year": 1989, "adaptations": [{"title": "A Time to Kill", "year": 1996, "type": "MOVIE"}]},
    {"title": "The Rainmaker", "author": "John Grisham", "year": 1995, "adaptations": [{"title": "The Rainmaker", "year": 1997, "type": "MOVIE"}]},

    # Spy/Espionage
    {"title": "Tinker Tailor Soldier Spy", "author": "John le Carré", "year": 1974, "adaptations": [{"title": "Tinker Tailor Soldier Spy", "year": 2011, "type": "MOVIE"}]},
    {"title": "The Spy Who Came in from the Cold", "author": "John le Carré", "year": 1963, "adaptations": [{"title": "The Spy Who Came in from the Cold", "year": 1965, "type": "MOVIE"}]},

    # Sci-Fi & Fantasy
    {"title": "Starship Troopers", "author": "Robert A. Heinlein", "year": 1959, "adaptations": [{"title": "Starship Troopers", "year": 1997, "type": "MOVIE"}]},
    {"title": "The NeverEnding Story", "author": "Michael Ende", "year": 1979, "adaptations": [{"title": "The NeverEnding Story", "year": 1984, "type": "MOVIE"}]},
    {"title": "The Princess Bride", "author": "William Goldman", "year": 1973, "adaptations": [{"title": "The Princess Bride", "year": 1987, "type": "MOVIE"}]},
    {"title": "Stardust", "author": "Neil Gaiman", "year": 1999, "adaptations": [{"title": "Stardust", "year": 2007, "type": "MOVIE"}]},

    # Horror
    {"title": "The Amityville Horror", "author": "Jay Anson", "year": 1977, "adaptations": [{"title": "The Amityville Horror", "year": 1979, "type": "MOVIE"}, {"title": "The Amityville Horror", "year": 2005, "type": "MOVIE"}]},
    {"title": "Ring", "author": "Koji Suzuki", "year": 1991, "adaptations": [{"title": "Ringu", "year": 1998, "type": "MOVIE"}, {"title": "The Ring", "year": 2002, "type": "MOVIE"}]},
    {"title": "The Woman in Black", "author": "Susan Hill", "year": 1983, "adaptations": [{"title": "The Woman in Black", "year": 2012, "type": "MOVIE"}]},

    # Major Graphic Novels
    {"title": "Watchmen", "author": "Alan Moore", "year": 1986, "adaptations": [{"title": "Watchmen", "year": 2009, "type": "MOVIE"}, {"title": "Watchmen", "year": 2019, "type": "TV"}]},
    {"title": "V for Vendetta", "author": "Alan Moore", "year": 1982, "adaptations": [{"title": "V for Vendetta", "year": 2005, "type": "MOVIE"}]},
    {"title": "Sin City", "author": "Frank Miller", "year": 1991, "adaptations": [{"title": "Sin City", "year": 2005, "type": "MOVIE"}]},
    {"title": "300", "author": "Frank Miller", "year": 1998, "adaptations": [{"title": "300", "year": 2006, "type": "MOVIE"}]},
    {"title": "Kick-Ass", "author": "Mark Millar", "year": 2008, "adaptations": [{"title": "Kick-Ass", "year": 2010, "type": "MOVIE"}]},
    {"title": "Scott Pilgrim", "author": "Bryan Lee O'Malley", "year": 2004, "adaptations": [{"title": "Scott Pilgrim vs. the World", "year": 2010, "type": "MOVIE"}]},
]


class Command(BaseCommand):
    help = 'Add second batch of 50 curated books and their adaptations'

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
        self.stdout.write(f'Processing {len(CURATED_BOOKS)} books (Batch 2)...')
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
            self.stdout.write(self.style.WARNING('  python manage.py add_curated_books_batch2 --execute'))

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
