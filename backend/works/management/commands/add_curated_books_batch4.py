"""Management command to add fourth batch of 100 curated books and their adaptations."""
import time
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from works.utils.google_books import search_book
from screen.models import ScreenWork, AdaptationEdge


# List of 100 curated books with their adaptations (Batch 4)
CURATED_BOOKS = [
    # Classic Literature (15)
    {"title": "Gone with the Wind", "author": "Margaret Mitchell", "year": 1936, "adaptations": [{"title": "Gone with the Wind", "year": 1939, "type": "MOVIE"}]},
    {"title": "Rebecca", "author": "Daphne du Maurier", "year": 1938, "adaptations": [{"title": "Rebecca", "year": 1940, "type": "MOVIE"}, {"title": "Rebecca", "year": 2020, "type": "MOVIE"}]},
    {"title": "The Wonderful Wizard of Oz", "author": "L. Frank Baum", "year": 1900, "adaptations": [{"title": "The Wizard of Oz", "year": 1939, "type": "MOVIE"}]},
    {"title": "Wuthering Heights", "author": "Emily Brontë", "year": 1847, "adaptations": [{"title": "Wuthering Heights", "year": 1992, "type": "MOVIE"}]},
    {"title": "The Count of Monte Cristo", "author": "Alexandre Dumas", "year": 1844, "adaptations": [{"title": "The Count of Monte Cristo", "year": 2002, "type": "MOVIE"}]},
    {"title": "The Three Musketeers", "author": "Alexandre Dumas", "year": 1844, "adaptations": [{"title": "The Three Musketeers", "year": 2011, "type": "MOVIE"}]},
    {"title": "Treasure Island", "author": "Robert Louis Stevenson", "year": 1883, "adaptations": [{"title": "Treasure Island", "year": 1950, "type": "MOVIE"}]},
    {"title": "Oliver Twist", "author": "Charles Dickens", "year": 1838, "adaptations": [{"title": "Oliver Twist", "year": 2005, "type": "MOVIE"}]},
    {"title": "A Tale of Two Cities", "author": "Charles Dickens", "year": 1859, "adaptations": [{"title": "A Tale of Two Cities", "year": 1935, "type": "MOVIE"}]},
    {"title": "Around the World in 80 Days", "author": "Jules Verne", "year": 1872, "adaptations": [{"title": "Around the World in 80 Days", "year": 2004, "type": "MOVIE"}]},
    {"title": "20,000 Leagues Under the Sea", "author": "Jules Verne", "year": 1870, "adaptations": [{"title": "20,000 Leagues Under the Sea", "year": 1954, "type": "MOVIE"}]},
    {"title": "The Invisible Man", "author": "H.G. Wells", "year": 1897, "adaptations": [{"title": "The Invisible Man", "year": 2020, "type": "MOVIE"}]},
    {"title": "Strange Case of Dr Jekyll and Mr Hyde", "author": "Robert Louis Stevenson", "year": 1886, "adaptations": [{"title": "Dr. Jekyll and Mr. Hyde", "year": 1941, "type": "MOVIE"}]},
    {"title": "Moby-Dick", "author": "Herman Melville", "year": 1851, "adaptations": [{"title": "Moby Dick", "year": 1956, "type": "MOVIE"}]},
    {"title": "Les Misérables", "author": "Victor Hugo", "year": 1862, "adaptations": [{"title": "Les Misérables", "year": 2012, "type": "MOVIE"}]},

    # Recent Bestsellers (10)
    {"title": "Where the Crawdads Sing", "author": "Delia Owens", "year": 2018, "adaptations": [{"title": "Where the Crawdads Sing", "year": 2022, "type": "MOVIE"}]},
    {"title": "The Goldfinch", "author": "Donna Tartt", "year": 2013, "adaptations": [{"title": "The Goldfinch", "year": 2019, "type": "MOVIE"}]},
    {"title": "Little Fires Everywhere", "author": "Celeste Ng", "year": 2017, "adaptations": [{"title": "Little Fires Everywhere", "year": 2020, "type": "TV"}]},
    {"title": "Big Little Lies", "author": "Liane Moriarty", "year": 2014, "adaptations": [{"title": "Big Little Lies", "year": 2017, "type": "TV"}]},
    {"title": "You Should Have Known", "author": "Jean Hanff Korelitz", "year": 2014, "adaptations": [{"title": "The Undoing", "year": 2020, "type": "TV"}]},
    {"title": "Sharp Objects", "author": "Gillian Flynn", "year": 2006, "adaptations": [{"title": "Sharp Objects", "year": 2018, "type": "TV"}]},
    {"title": "The Night Manager", "author": "John le Carré", "year": 1993, "adaptations": [{"title": "The Night Manager", "year": 2016, "type": "TV"}]},
    {"title": "Normal People", "author": "Sally Rooney", "year": 2018, "adaptations": [{"title": "Normal People", "year": 2020, "type": "TV"}]},
    {"title": "Conversations with Friends", "author": "Sally Rooney", "year": 2017, "adaptations": [{"title": "Conversations with Friends", "year": 2022, "type": "TV"}]},
    {"title": "The Time Traveler's Wife", "author": "Audrey Niffenegger", "year": 2003, "adaptations": [{"title": "The Time Traveler's Wife", "year": 2009, "type": "MOVIE"}]},

    # Nicholas Sparks (5)
    {"title": "Message in a Bottle", "author": "Nicholas Sparks", "year": 1998, "adaptations": [{"title": "Message in a Bottle", "year": 1999, "type": "MOVIE"}]},
    {"title": "Nights in Rodanthe", "author": "Nicholas Sparks", "year": 2002, "adaptations": [{"title": "Nights in Rodanthe", "year": 2008, "type": "MOVIE"}]},
    {"title": "Dear John", "author": "Nicholas Sparks", "year": 2006, "adaptations": [{"title": "Dear John", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Last Song", "author": "Nicholas Sparks", "year": 2009, "adaptations": [{"title": "The Last Song", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Lucky One", "author": "Nicholas Sparks", "year": 2008, "adaptations": [{"title": "The Lucky One", "year": 2012, "type": "MOVIE"}]},

    # Thriller/Mystery (15)
    {"title": "Angels & Demons", "author": "Dan Brown", "year": 2000, "adaptations": [{"title": "Angels & Demons", "year": 2009, "type": "MOVIE"}]},
    {"title": "The Bone Collector", "author": "Jeffery Deaver", "year": 1997, "adaptations": [{"title": "The Bone Collector", "year": 1999, "type": "MOVIE"}]},
    {"title": "Mystic River", "author": "Dennis Lehane", "year": 2001, "adaptations": [{"title": "Mystic River", "year": 2003, "type": "MOVIE"}]},
    {"title": "The Girl on the Train", "author": "Paula Hawkins", "year": 2015, "adaptations": [{"title": "The Girl on the Train", "year": 2016, "type": "MOVIE"}]},
    {"title": "Before I Go to Sleep", "author": "S.J. Watson", "year": 2011, "adaptations": [{"title": "Before I Go to Sleep", "year": 2014, "type": "MOVIE"}]},
    {"title": "The Woman in the Window", "author": "A.J. Finn", "year": 2018, "adaptations": [{"title": "The Woman in the Window", "year": 2021, "type": "MOVIE"}]},
    {"title": "In the Woods", "author": "Tana French", "year": 2007, "adaptations": [{"title": "Dublin Murders", "year": 2019, "type": "TV"}]},
    {"title": "The Killing", "author": "David Hewson", "year": 2012, "adaptations": [{"title": "The Killing", "year": 2011, "type": "TV"}]},
    {"title": "The Black Echo", "author": "Michael Connelly", "year": 1992, "adaptations": [{"title": "Bosch", "year": 2014, "type": "TV"}]},
    {"title": "Killing Floor", "author": "Lee Child", "year": 1997, "adaptations": [{"title": "Jack Reacher", "year": 2012, "type": "MOVIE"}]},
    {"title": "The Lincoln Lawyer", "author": "Michael Connelly", "year": 2005, "adaptations": [{"title": "The Lincoln Lawyer", "year": 2011, "type": "MOVIE"}]},
    {"title": "Presumed Innocent", "author": "Scott Turow", "year": 1987, "adaptations": [{"title": "Presumed Innocent", "year": 1990, "type": "MOVIE"}]},
    {"title": "Along Came a Spider", "author": "James Patterson", "year": 1993, "adaptations": [{"title": "Along Came a Spider", "year": 2001, "type": "MOVIE"}]},
    {"title": "Kiss the Girls", "author": "James Patterson", "year": 1995, "adaptations": [{"title": "Kiss the Girls", "year": 1997, "type": "MOVIE"}]},
    {"title": "The Silence of the Lambs", "author": "Thomas Harris", "year": 1988, "adaptations": [{"title": "The Silence of the Lambs", "year": 1991, "type": "MOVIE"}]},

    # Sci-Fi (15)
    {"title": "The Time Machine", "author": "H.G. Wells", "year": 1895, "adaptations": [{"title": "The Time Machine", "year": 2002, "type": "MOVIE"}]},
    {"title": "The War of the Worlds", "author": "H.G. Wells", "year": 1898, "adaptations": [{"title": "War of the Worlds", "year": 2005, "type": "MOVIE"}]},
    {"title": "I, Robot", "author": "Isaac Asimov", "year": 1950, "adaptations": [{"title": "I, Robot", "year": 2004, "type": "MOVIE"}]},
    {"title": "Do Androids Dream of Electric Sheep?", "author": "Philip K. Dick", "year": 1968, "adaptations": [{"title": "Blade Runner", "year": 1982, "type": "MOVIE"}]},
    {"title": "A Scanner Darkly", "author": "Philip K. Dick", "year": 1977, "adaptations": [{"title": "A Scanner Darkly", "year": 2006, "type": "MOVIE"}]},
    {"title": "Minority Report", "author": "Philip K. Dick", "year": 1956, "adaptations": [{"title": "Minority Report", "year": 2002, "type": "MOVIE"}]},
    {"title": "We Can Remember It for You Wholesale", "author": "Philip K. Dick", "year": 1966, "adaptations": [{"title": "Total Recall", "year": 1990, "type": "MOVIE"}]},
    {"title": "The Man in the High Castle", "author": "Philip K. Dick", "year": 1962, "adaptations": [{"title": "The Man in the High Castle", "year": 2015, "type": "TV"}]},
    {"title": "Altered Carbon", "author": "Richard K. Morgan", "year": 2002, "adaptations": [{"title": "Altered Carbon", "year": 2018, "type": "TV"}]},
    {"title": "Foundation", "author": "Isaac Asimov", "year": 1951, "adaptations": [{"title": "Foundation", "year": 2021, "type": "TV"}]},
    {"title": "Dune", "author": "Frank Herbert", "year": 1965, "adaptations": [{"title": "Dune", "year": 2021, "type": "MOVIE"}]},
    {"title": "Ender's Game", "author": "Orson Scott Card", "year": 1985, "adaptations": [{"title": "Ender's Game", "year": 2013, "type": "MOVIE"}]},
    {"title": "The Hitchhiker's Guide to the Galaxy", "author": "Douglas Adams", "year": 1979, "adaptations": [{"title": "The Hitchhiker's Guide to the Galaxy", "year": 2005, "type": "MOVIE"}]},
    {"title": "Solaris", "author": "Stanisław Lem", "year": 1961, "adaptations": [{"title": "Solaris", "year": 2002, "type": "MOVIE"}]},
    {"title": "Annihilation", "author": "Jeff VanderMeer", "year": 2014, "adaptations": [{"title": "Annihilation", "year": 2018, "type": "MOVIE"}]},

    # Horror (8)
    {"title": "Let the Right One In", "author": "John Ajvide Lindqvist", "year": 2004, "adaptations": [{"title": "Let Me In", "year": 2010, "type": "MOVIE"}]},
    {"title": "The Haunting of Hill House", "author": "Shirley Jackson", "year": 1959, "adaptations": [{"title": "The Haunting of Hill House", "year": 2018, "type": "TV"}]},
    {"title": "The Mist", "author": "Stephen King", "year": 1980, "adaptations": [{"title": "The Mist", "year": 2007, "type": "MOVIE"}]},
    {"title": "Pet Sematary", "author": "Stephen King", "year": 1983, "adaptations": [{"title": "Pet Sematary", "year": 1989, "type": "MOVIE"}]},
    {"title": "Misery", "author": "Stephen King", "year": 1987, "adaptations": [{"title": "Misery", "year": 1990, "type": "MOVIE"}]},
    {"title": "Interview with the Vampire", "author": "Anne Rice", "year": 1976, "adaptations": [{"title": "Interview with the Vampire", "year": 1994, "type": "MOVIE"}]},
    {"title": "The Silence", "author": "Tim Lebbon", "year": 2015, "adaptations": [{"title": "The Silence", "year": 2019, "type": "MOVIE"}]},
    {"title": "Bird Box", "author": "Josh Malerman", "year": 2014, "adaptations": [{"title": "Bird Box", "year": 2018, "type": "MOVIE"}]},

    # YA Dystopian (5)
    {"title": "The Host", "author": "Stephenie Meyer", "year": 2008, "adaptations": [{"title": "The Host", "year": 2013, "type": "MOVIE"}]},
    {"title": "Uglies", "author": "Scott Westerfeld", "year": 2005, "adaptations": [{"title": "Uglies", "year": 2024, "type": "MOVIE"}]},
    {"title": "The 5th Wave", "author": "Rick Yancey", "year": 2013, "adaptations": [{"title": "The 5th Wave", "year": 2016, "type": "MOVIE"}]},
    {"title": "Divergent", "author": "Veronica Roth", "year": 2011, "adaptations": [{"title": "Divergent", "year": 2014, "type": "MOVIE"}]},
    {"title": "The Giver", "author": "Lois Lowry", "year": 1993, "adaptations": [{"title": "The Giver", "year": 2014, "type": "MOVIE"}]},

    # Children's/Family (10)
    {"title": "Charlotte's Web", "author": "E.B. White", "year": 1952, "adaptations": [{"title": "Charlotte's Web", "year": 2006, "type": "MOVIE"}]},
    {"title": "Stuart Little", "author": "E.B. White", "year": 1945, "adaptations": [{"title": "Stuart Little", "year": 1999, "type": "MOVIE"}]},
    {"title": "The BFG", "author": "Roald Dahl", "year": 1982, "adaptations": [{"title": "The BFG", "year": 2016, "type": "MOVIE"}]},
    {"title": "Matilda", "author": "Roald Dahl", "year": 1988, "adaptations": [{"title": "Matilda", "year": 1996, "type": "MOVIE"}]},
    {"title": "James and the Giant Peach", "author": "Roald Dahl", "year": 1961, "adaptations": [{"title": "James and the Giant Peach", "year": 1996, "type": "MOVIE"}]},
    {"title": "The Witches", "author": "Roald Dahl", "year": 1983, "adaptations": [{"title": "The Witches", "year": 1990, "type": "MOVIE"}]},
    {"title": "Fantastic Mr. Fox", "author": "Roald Dahl", "year": 1970, "adaptations": [{"title": "Fantastic Mr. Fox", "year": 2009, "type": "MOVIE"}]},
    {"title": "Where the Wild Things Are", "author": "Maurice Sendak", "year": 1963, "adaptations": [{"title": "Where the Wild Things Are", "year": 2009, "type": "MOVIE"}]},
    {"title": "The Cat in the Hat", "author": "Dr. Seuss", "year": 1957, "adaptations": [{"title": "The Cat in the Hat", "year": 2003, "type": "MOVIE"}]},
    {"title": "Horton Hears a Who!", "author": "Dr. Seuss", "year": 1954, "adaptations": [{"title": "Horton Hears a Who!", "year": 2008, "type": "MOVIE"}]},

    # Fantasy (7)
    {"title": "The Last Unicorn", "author": "Peter S. Beagle", "year": 1968, "adaptations": [{"title": "The Last Unicorn", "year": 1982, "type": "MOVIE"}]},
    {"title": "The Secret Garden", "author": "Frances Hodgson Burnett", "year": 1911, "adaptations": [{"title": "The Secret Garden", "year": 2020, "type": "MOVIE"}]},
    {"title": "A Little Princess", "author": "Frances Hodgson Burnett", "year": 1905, "adaptations": [{"title": "A Little Princess", "year": 1995, "type": "MOVIE"}]},
    {"title": "The Dark Is Rising", "author": "Susan Cooper", "year": 1973, "adaptations": [{"title": "The Seeker", "year": 2007, "type": "MOVIE"}]},
    {"title": "The Spiderwick Chronicles", "author": "Tony DiTerlizzi", "year": 2003, "adaptations": [{"title": "The Spiderwick Chronicles", "year": 2008, "type": "MOVIE"}]},
    {"title": "Inkheart", "author": "Cornelia Funke", "year": 2003, "adaptations": [{"title": "Inkheart", "year": 2008, "type": "MOVIE"}]},
    {"title": "Northern Lights", "author": "Philip Pullman", "year": 1995, "adaptations": [{"title": "The Golden Compass", "year": 2007, "type": "MOVIE"}]},

    # Graphic Novels (6)
    {"title": "American Splendor", "author": "Harvey Pekar", "year": 1976, "adaptations": [{"title": "American Splendor", "year": 2003, "type": "MOVIE"}]},
    {"title": "Ghost World", "author": "Daniel Clowes", "year": 1997, "adaptations": [{"title": "Ghost World", "year": 2001, "type": "MOVIE"}]},
    {"title": "A History of Violence", "author": "John Wagner", "year": 1997, "adaptations": [{"title": "A History of Violence", "year": 2005, "type": "MOVIE"}]},
    {"title": "Road to Perdition", "author": "Max Allan Collins", "year": 1998, "adaptations": [{"title": "Road to Perdition", "year": 2002, "type": "MOVIE"}]},
    {"title": "From Hell", "author": "Alan Moore", "year": 1989, "adaptations": [{"title": "From Hell", "year": 2001, "type": "MOVIE"}]},
    {"title": "The League of Extraordinary Gentlemen", "author": "Alan Moore", "year": 1999, "adaptations": [{"title": "The League of Extraordinary Gentlemen", "year": 2003, "type": "MOVIE"}]},

    # Biography/True Stories (4)
    {"title": "Into the Wild", "author": "Jon Krakauer", "year": 1996, "adaptations": [{"title": "Into the Wild", "year": 2007, "type": "MOVIE"}]},
    {"title": "Catch Me If You Can", "author": "Frank Abagnale", "year": 1980, "adaptations": [{"title": "Catch Me If You Can", "year": 2002, "type": "MOVIE"}]},
    {"title": "The Accidental Billionaires", "author": "Ben Mezrich", "year": 2009, "adaptations": [{"title": "The Social Network", "year": 2010, "type": "MOVIE"}]},
    {"title": "Moneyball", "author": "Michael Lewis", "year": 2003, "adaptations": [{"title": "Moneyball", "year": 2011, "type": "MOVIE"}]},
]


class Command(BaseCommand):
    help = 'Add fourth batch of 100 curated books and their adaptations'

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
        self.stdout.write(f'Processing {len(CURATED_BOOKS)} books (Batch 4)...')
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
            self.stdout.write(self.style.WARNING('  python manage.py add_curated_books_batch4 --execute'))

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
