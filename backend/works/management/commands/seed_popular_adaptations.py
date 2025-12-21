"""Management command to seed popular book-to-movie adaptations."""
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from works.models import Work
from screen.models import ScreenWork, AdaptationEdge


# Curated list of popular book-to-movie adaptations
# Format: (book_title, book_year, movie_title, movie_year, movie_type)
POPULAR_ADAPTATIONS = [
    # Classics
    ("The Lord of the Rings", 1954, "The Lord of the Rings: The Fellowship of the Ring", 2001, "MOVIE"),
    ("The Lord of the Rings", 1954, "The Lord of the Rings: The Two Towers", 2002, "MOVIE"),
    ("The Lord of the Rings", 1954, "The Lord of the Rings: The Return of the King", 2003, "MOVIE"),
    ("The Hobbit", 1937, "The Hobbit: An Unexpected Journey", 2012, "MOVIE"),
    ("The Hobbit", 1937, "The Hobbit: The Desolation of Smaug", 2013, "MOVIE"),
    ("The Hobbit", 1937, "The Hobbit: The Battle of the Five Armies", 2014, "MOVIE"),

    # Harry Potter Series
    ("Harry Potter and the Philosopher's Stone", 1997, "Harry Potter and the Sorcerer's Stone", 2001, "MOVIE"),
    ("Harry Potter and the Chamber of Secrets", 1998, "Harry Potter and the Chamber of Secrets", 2002, "MOVIE"),
    ("Harry Potter and the Prisoner of Azkaban", 1999, "Harry Potter and the Prisoner of Azkaban", 2004, "MOVIE"),
    ("Harry Potter and the Goblet of Fire", 2000, "Harry Potter and the Goblet of Fire", 2005, "MOVIE"),
    ("Harry Potter and the Order of the Phoenix", 2003, "Harry Potter and the Order of the Phoenix", 2007, "MOVIE"),
    ("Harry Potter and the Half-Blood Prince", 2005, "Harry Potter and the Half-Blood Prince", 2009, "MOVIE"),
    ("Harry Potter and the Deathly Hallows", 2007, "Harry Potter and the Deathly Hallows: Part 1", 2010, "MOVIE"),
    ("Harry Potter and the Deathly Hallows", 2007, "Harry Potter and the Deathly Hallows: Part 2", 2011, "MOVIE"),

    # Modern Classics
    ("Dune", 1965, "Dune", 2021, "MOVIE"),
    ("Dune", 1965, "Dune", 1984, "MOVIE"),
    ("The Hunger Games", 2008, "The Hunger Games", 2012, "MOVIE"),
    ("The Hunger Games", 2008, "The Hunger Games: Catching Fire", 2013, "MOVIE"),
    ("The Hunger Games", 2008, "The Hunger Games: Mockingjay - Part 1", 2014, "MOVIE"),
    ("The Hunger Games", 2008, "The Hunger Games: Mockingjay - Part 2", 2015, "MOVIE"),

    # Sci-Fi
    ("Jurassic Park", 1990, "Jurassic Park", 1993, "MOVIE"),
    ("The Lost World", 1995, "The Lost World: Jurassic Park", 1997, "MOVIE"),
    ("The Martian", 2011, "The Martian", 2015, "MOVIE"),
    ("Ender's Game", 1985, "Ender's Game", 2013, "MOVIE"),
    ("Ready Player One", 2011, "Ready Player One", 2018, "MOVIE"),
    ("Blade Runner", 1968, "Blade Runner", 1982, "MOVIE"),  # Based on "Do Androids Dream of Electric Sheep?"
    ("Blade Runner", 1968, "Blade Runner 2049", 2017, "MOVIE"),

    # Thriller/Mystery
    ("Gone Girl", 2012, "Gone Girl", 2014, "MOVIE"),
    ("The Girl with the Dragon Tattoo", 2005, "The Girl with the Dragon Tattoo", 2011, "MOVIE"),
    ("The Girl with the Dragon Tattoo", 2005, "The Girl with the Dragon Tattoo", 2009, "MOVIE"),
    ("The Silence of the Lambs", 1988, "The Silence of the Lambs", 1991, "MOVIE"),
    ("The Da Vinci Code", 2003, "The Da Vinci Code", 2006, "MOVIE"),

    # Horror/Suspense
    ("The Shining", 1977, "The Shining", 1980, "MOVIE"),
    ("The Shining", 1977, "The Shining", 1997, "TV"),
    ("It", 1986, "It", 2017, "MOVIE"),
    ("It", 1986, "It Chapter Two", 2019, "MOVIE"),
    ("It", 1986, "It", 1990, "TV"),

    # Fantasy
    ("The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", 1950, "The Chronicles of Narnia: The Lion, the Witch and the Wardrobe", 2005, "MOVIE"),
    ("The Chronicles of Narnia: Prince Caspian", 1951, "The Chronicles of Narnia: Prince Caspian", 2008, "MOVIE"),
    ("Twilight", 2005, "Twilight", 2008, "MOVIE"),
    ("Twilight", 2005, "The Twilight Saga: New Moon", 2009, "MOVIE"),
    ("Twilight", 2005, "The Twilight Saga: Eclipse", 2010, "MOVIE"),
    ("Twilight", 2005, "The Twilight Saga: Breaking Dawn - Part 1", 2011, "MOVIE"),
    ("Twilight", 2005, "The Twilight Saga: Breaking Dawn - Part 2", 2012, "MOVIE"),

    # Literary Classics
    ("To Kill a Mockingbird", 1960, "To Kill a Mockingbird", 1962, "MOVIE"),
    ("The Great Gatsby", 1925, "The Great Gatsby", 2013, "MOVIE"),
    ("The Great Gatsby", 1925, "The Great Gatsby", 1974, "MOVIE"),
    ("Pride and Prejudice", 1813, "Pride and Prejudice", 2005, "MOVIE"),
    ("Pride and Prejudice", 1813, "Pride and Prejudice", 1995, "TV"),
    ("The Godfather", 1969, "The Godfather", 1972, "MOVIE"),
    ("The Godfather", 1969, "The Godfather Part II", 1974, "MOVIE"),

    # YA Novels
    ("The Fault in Our Stars", 2012, "The Fault in Our Stars", 2014, "MOVIE"),
    ("The Maze Runner", 2009, "The Maze Runner", 2014, "MOVIE"),
    ("The Maze Runner", 2009, "Maze Runner: The Scorch Trials", 2015, "MOVIE"),
    ("Divergent", 2011, "Divergent", 2014, "MOVIE"),
    ("Divergent", 2011, "The Divergent Series: Insurgent", 2015, "MOVIE"),
    ("The Perks of Being a Wallflower", 1999, "The Perks of Being a Wallflower", 2012, "MOVIE"),

    # Modern Fiction
    ("The Help", 2009, "The Help", 2011, "MOVIE"),
    ("Life of Pi", 2001, "Life of Pi", 2012, "MOVIE"),
    ("Forrest Gump", 1986, "Forrest Gump", 1994, "MOVIE"),
    ("Fight Club", 1996, "Fight Club", 1999, "MOVIE"),
    ("The Shawshank Redemption", 1982, "The Shawshank Redemption", 1994, "MOVIE"),  # Based on "Rita Hayworth and Shawshank Redemption"

    # TV Series
    ("Game of Thrones", 1996, "Game of Thrones", 2011, "TV"),  # Based on "A Song of Ice and Fire" series
    ("The Handmaid's Tale", 1985, "The Handmaid's Tale", 2017, "TV"),
    ("Big Little Lies", 2014, "Big Little Lies", 2017, "TV"),
    ("The Queen's Gambit", 1983, "The Queen's Gambit", 2020, "TV"),
    ("Outlander", 1991, "Outlander", 2014, "TV"),

    # Michael Crichton
    ("The Andromeda Strain", 1969, "The Andromeda Strain", 1971, "MOVIE"),
    ("The Andromeda Strain", 1969, "The Andromeda Strain", 2008, "TV"),
    ("The Terminal Man", 1972, "The Terminal Man", 1974, "MOVIE"),
    ("The Great Train Robbery", 1975, "The Great Train Robbery", 1978, "MOVIE"),
    ("Congo", 1980, "Congo", 1995, "MOVIE"),
    ("Sphere", 1987, "Sphere", 1998, "MOVIE"),
    ("Rising Sun", 1992, "Rising Sun", 1993, "MOVIE"),
    ("Disclosure", 1994, "Disclosure", 1994, "MOVIE"),
    ("Eaters of the Dead", 1976, "The 13th Warrior", 1999, "MOVIE"),
    ("Timeline", 1999, "Timeline", 2003, "MOVIE"),
    ("Prey", 2002, "Prey", 2007, "TV"),
    ("Westworld", 1973, "Westworld", 1973, "MOVIE"),
    ("Westworld", 1973, "Westworld", 2016, "TV"),

    # Stephen King
    ("Carrie", 1974, "Carrie", 1976, "MOVIE"),
    ("Carrie", 1974, "Carrie", 2002, "TV"),
    ("Carrie", 1974, "Carrie", 2013, "MOVIE"),
    ("Salem's Lot", 1975, "Salem's Lot", 1979, "TV"),
    ("Salem's Lot", 1975, "Salem's Lot", 2004, "TV"),
    ("The Dead Zone", 1979, "The Dead Zone", 1983, "MOVIE"),
    ("The Dead Zone", 1979, "The Dead Zone", 2002, "TV"),
    ("Cujo", 1981, "Cujo", 1983, "MOVIE"),
    ("Christine", 1983, "Christine", 1983, "MOVIE"),
    ("The Body", 1982, "Stand by Me", 1986, "MOVIE"),
    ("Pet Sematary", 1983, "Pet Sematary", 1989, "MOVIE"),
    ("Pet Sematary", 1983, "Pet Sematary", 2019, "MOVIE"),
    ("The Running Man", 1982, "The Running Man", 1987, "MOVIE"),
    ("Misery", 1987, "Misery", 1990, "MOVIE"),
    ("The Stand", 1978, "The Stand", 1994, "TV"),
    ("The Stand", 1978, "The Stand", 2020, "TV"),
    ("Needful Things", 1991, "Needful Things", 1993, "MOVIE"),
    ("The Green Mile", 1996, "The Green Mile", 1999, "MOVIE"),
    ("Hearts in Atlantis", 1999, "Hearts in Atlantis", 2001, "MOVIE"),
    ("Dreamcatcher", 2001, "Dreamcatcher", 2003, "MOVIE"),
    ("Secret Window, Secret Garden", 1990, "Secret Window", 2004, "MOVIE"),
    ("Riding the Bullet", 2000, "Riding the Bullet", 2004, "MOVIE"),
    ("1408", 1999, "1408", 2007, "MOVIE"),
    ("The Mist", 1980, "The Mist", 2007, "MOVIE"),
    ("Children of the Corn", 1977, "Children of the Corn", 1984, "MOVIE"),
    ("Firestarter", 1980, "Firestarter", 1984, "MOVIE"),
    ("Firestarter", 1980, "Firestarter", 2022, "MOVIE"),
    ("Doctor Sleep", 2013, "Doctor Sleep", 2019, "MOVIE"),
    ("11/22/63", 2011, "11/22/63", 2016, "TV"),
    ("Mr. Mercedes", 2014, "Mr. Mercedes", 2017, "TV"),
    ("The Outsider", 2018, "The Outsider", 2020, "TV"),
    ("Under the Dome", 2009, "Under the Dome", 2013, "TV"),
    ("Gerald's Game", 1992, "Gerald's Game", 2017, "MOVIE"),
    ("Dolores Claiborne", 1992, "Dolores Claiborne", 1995, "MOVIE"),
]


class Command(BaseCommand):
    help = 'Seed database with popular book-to-movie adaptations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without saving to database',
        )
        parser.add_argument(
            '--skip-tmdb',
            action='store_true',
            help='Skip TMDb enrichment (faster, but no metadata)',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of adaptations to process',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        skip_tmdb = options['skip_tmdb']
        limit = options.get('limit')

        if not settings.TMDB_API_KEY and not skip_tmdb:
            self.stdout.write(
                self.style.WARNING('TMDB_API_KEY not set. Using --skip-tmdb mode.')
            )
            skip_tmdb = True

        self.stdout.write(self.style.SUCCESS('Starting to seed popular adaptations...'))

        stats = {
            'works_created': 0,
            'works_found': 0,
            'screen_works_created': 0,
            'screen_works_found': 0,
            'edges_created': 0,
            'edges_found': 0,
            'tmdb_enriched': 0,
            'errors': 0,
        }

        adaptations_to_process = POPULAR_ADAPTATIONS[:limit] if limit else POPULAR_ADAPTATIONS
        total = len(adaptations_to_process)

        for i, (book_title, book_year, movie_title, movie_year, movie_type) in enumerate(adaptations_to_process, 1):
            self.stdout.write(f'\n[{i}/{total}] Processing: {book_title} → {movie_title}')

            try:
                # Create or get work
                if not dry_run:
                    work, work_created = Work.objects.get_or_create(
                        title=book_title,
                        defaults={
                            'year': book_year,
                        }
                    )
                    if work_created:
                        stats['works_created'] += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Created book: {book_title}'))
                    else:
                        stats['works_found'] += 1
                        self.stdout.write(f'  → Found existing book: {book_title}')

                    # Create or get screen work
                    # Use title + year to avoid slug collisions (e.g., Dune 1984 vs Dune 2021)
                    screen_work, screen_created = ScreenWork.objects.get_or_create(
                        title=movie_title,
                        year=movie_year,
                        type=movie_type,
                        defaults={}
                    )
                    if screen_created:
                        stats['screen_works_created'] += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Created adaptation: {movie_title} ({movie_year})'))

                        # Enrich from TMDb
                        if not skip_tmdb:
                            enriched = self.enrich_from_tmdb(screen_work)
                            if enriched:
                                stats['tmdb_enriched'] += 1
                                self.stdout.write(self.style.SUCCESS(f'    ✓ Enriched from TMDb'))
                    else:
                        stats['screen_works_found'] += 1
                        self.stdout.write(f'  → Found existing adaptation: {movie_title} ({movie_year})')

                    # Create adaptation edge
                    edge, edge_created = AdaptationEdge.objects.get_or_create(
                        work=work,
                        screen_work=screen_work,
                        defaults={
                            'relation_type': 'BASED_ON',
                            'source': 'MANUAL',
                        }
                    )
                    if edge_created:
                        stats['edges_created'] += 1
                        self.stdout.write(self.style.SUCCESS(f'  ✓ Linked book and adaptation'))
                    else:
                        stats['edges_found'] += 1

                else:
                    self.stdout.write(f'  Would create: {book_title} ({book_year}) → {movie_title} ({movie_year})')

            except Exception as e:
                stats['errors'] += 1
                self.stdout.write(self.style.ERROR(f'  ✗ Error: {str(e)}'))

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(f'  Books created: {stats["works_created"]}')
        self.stdout.write(f'  Books found: {stats["works_found"]}')
        self.stdout.write(f'  Adaptations created: {stats["screen_works_created"]}')
        self.stdout.write(f'  Adaptations found: {stats["screen_works_found"]}')
        self.stdout.write(f'  Links created: {stats["edges_created"]}')
        self.stdout.write(f'  Links found: {stats["edges_found"]}')
        if not skip_tmdb:
            self.stdout.write(f'  TMDb enriched: {stats["tmdb_enriched"]}')
        if stats['errors'] > 0:
            self.stdout.write(self.style.WARNING(f'  Errors: {stats["errors"]}'))
        self.stdout.write('=' * 70)

    def enrich_from_tmdb(self, screen_work):
        """Enrich screen work with TMDb data."""
        try:
            media_type = 'movie' if screen_work.type == 'MOVIE' else 'tv'
            search_url = f"https://api.themoviedb.org/3/search/{media_type}"
            params = {
                'api_key': settings.TMDB_API_KEY,
                'query': screen_work.title,
            }
            if screen_work.year:
                year_param = 'first_air_date_year' if media_type == 'tv' else 'year'
                params[year_param] = screen_work.year

            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            if not data.get('results'):
                return False

            result = data['results'][0]

            # Get detailed data
            detail_url = f"https://api.themoviedb.org/3/{media_type}/{result['id']}"
            detail_response = requests.get(detail_url, params={'api_key': settings.TMDB_API_KEY}, timeout=10)
            detail_response.raise_for_status()
            tmdb_data = detail_response.json()

            # Update screen work
            screen_work.tmdb_id = result['id']
            screen_work.tmdb_popularity = result.get('popularity', 0.0)

            if tmdb_data.get('overview'):
                screen_work.summary = tmdb_data['overview']

            if tmdb_data.get('poster_path'):
                # Use w780 for higher quality posters
                screen_work.poster_url = f"https://image.tmdb.org/t/p/w780{tmdb_data['poster_path']}"

            screen_work.save()
            return True

        except Exception as e:
            self.stdout.write(self.style.WARNING(f'    TMDb enrichment failed: {str(e)}'))
            return False
