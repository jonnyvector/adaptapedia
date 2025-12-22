#!/usr/bin/env python
"""Create individual books for popular series and map them correctly to movies."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')
django.setup()

from works.models import Work
from screen.models import ScreenWork, AdaptationEdge

# Popular series with individual book-to-movie mappings
# Format: (book_title, author, movie_title_contains, movie_year)
SERIES = {
    'Twilight': {
        'author': 'Stephenie Meyer',
        'books': [
            ('Twilight', 'Twilight', 2008),
            ('New Moon', 'New Moon', 2009),
            ('Eclipse', 'Eclipse', 2010),
            ('Breaking Dawn', 'Breaking Dawn - Part 1', 2011),
            ('Breaking Dawn', 'Breaking Dawn - Part 2', 2012),
        ]
    },
    'Harry Potter': {
        'author': 'J.K. Rowling',
        'books': [
            ("Harry Potter and the Philosopher's Stone", "Sorcerer's Stone", 2001),
            ('Harry Potter and the Chamber of Secrets', 'Chamber of Secrets', 2002),
            ('Harry Potter and the Prisoner of Azkaban', 'Prisoner of Azkaban', 2004),
            ('Harry Potter and the Goblet of Fire', 'Goblet of Fire', 2005),
            ('Harry Potter and the Order of the Phoenix', 'Order of the Phoenix', 2007),
            ('Harry Potter and the Half-Blood Prince', 'Half-Blood Prince', 2009),
            ('Harry Potter and the Deathly Hallows', 'Deathly Hallows: Part 1', 2010),
            ('Harry Potter and the Deathly Hallows', 'Deathly Hallows: Part 2', 2011),
        ]
    },
    'The Hunger Games': {
        'author': 'Suzanne Collins',
        'books': [
            ('The Hunger Games', 'The Hunger Games', 2012),
            ('Catching Fire', 'Catching Fire', 2013),
            ('Mockingjay', 'Mockingjay - Part 1', 2014),
            ('Mockingjay', 'Mockingjay - Part 2', 2015),
        ]
    },
    'Divergent': {
        'author': 'Veronica Roth',
        'books': [
            ('Divergent', 'Divergent', 2014),
            ('Insurgent', 'Insurgent', 2015),
            ('Allegiant', 'Allegiant', 2016),
        ]
    },
    'The Maze Runner': {
        'author': 'James Dashner',
        'books': [
            ('The Maze Runner', 'The Maze Runner', 2014),
            ('The Scorch Trials', 'Scorch Trials', 2015),
            ('The Death Cure', 'Death Cure', 2018),
        ]
    },
    'The Lord of the Rings': {
        'author': 'J.R.R. Tolkien',
        'books': [
            ('The Fellowship of the Ring', 'Fellowship of the Ring', 2001),
            ('The Two Towers', 'Two Towers', 2002),
            ('The Return of the King', 'Return of the King', 2003),
        ]
    },
    'The Hobbit': {
        'author': 'J.R.R. Tolkien',
        'books': [
            ('The Hobbit', 'An Unexpected Journey', 2012),
            ('The Hobbit', 'Desolation of Smaug', 2013),
            ('The Hobbit', 'Battle of the Five Armies', 2014),
        ]
    },
    'The Chronicles of Narnia': {
        'author': 'C.S. Lewis',
        'books': [
            ('The Lion, the Witch and the Wardrobe', 'Lion, the Witch', 2005),
            ('Prince Caspian', 'Prince Caspian', 2008),
            ('The Voyage of the Dawn Treader', 'Dawn Treader', 2010),
        ]
    },
}

def create_series_books():
    """Create individual books for series and map to correct movies."""
    print('Creating individual books for popular series...\n')

    stats = {
        'books_created': 0,
        'books_existing': 0,
        'edges_created': 0,
        'edges_existing': 0,
        'movies_not_found': 0,
    }

    for series_name, series_info in SERIES.items():
        print(f'\n=== {series_name} ===')
        author = series_info['author']

        for book_title, movie_keyword, movie_year in series_info['books']:
            print(f'\n  Book: {book_title}')

            # Find or create the book
            book = Work.objects.filter(title=book_title, author=author).first()

            if not book:
                print(f'    Creating book...')
                book = Work.objects.create(
                    title=book_title,
                    author=author,
                )
                stats['books_created'] += 1
            else:
                print(f'    Book already exists (ID: {book.id})')
                stats['books_existing'] += 1

            # Find the movie
            movies = ScreenWork.objects.filter(
                title__icontains=movie_keyword,
                year=movie_year
            )

            if not movies.exists():
                print(f'    ⚠ Movie not found: "{movie_keyword}" ({movie_year})')
                stats['movies_not_found'] += 1
                continue

            movie = movies.first()
            print(f'    Movie: {movie.title} ({movie.year})')

            # Create edge if it doesn't exist
            edge_exists = AdaptationEdge.objects.filter(work=book, screen_work=movie).exists()

            if not edge_exists:
                print(f'    Creating adaptation edge')
                AdaptationEdge.objects.create(
                    work=book,
                    screen_work=movie,
                    source='MANUAL',
                )
                stats['edges_created'] += 1
            else:
                print(f'    Edge already exists')
                stats['edges_existing'] += 1

    print('\n\n=== Summary ===')
    print(f'Books created: {stats["books_created"]}')
    print(f'Books already existing: {stats["books_existing"]}')
    print(f'Edges created: {stats["edges_created"]}')
    print(f'Edges already existing: {stats["edges_existing"]}')
    print(f'Movies not found: {stats["movies_not_found"]}')


def cleanup_incorrect_mappings():
    """Remove incorrect many-to-many mappings for omnibus books."""
    print('\n\n=== Cleaning up incorrect mappings ===')

    # Books that should NOT have multiple movie adaptations
    omnibus_books = [
        'Twilight',  # Only first movie
        'The Hunger Games',  # Only first movie
        'The Lord of the Rings',  # Should be split into 3 books
        'The Hobbit',  # All 3 movies from same book
    ]

    for book_title in omnibus_books:
        books = Work.objects.filter(title=book_title)

        for book in books:
            edges = AdaptationEdge.objects.filter(work=book)

            if edges.count() > 1:
                print(f'\n{book.title} by {book.author}:')
                print(f'  Currently mapped to {edges.count()} adaptations')

                # Special handling
                if book_title == 'Twilight' and book.author == 'Stephenie Meyer':
                    # Keep only the 2008 Twilight movie
                    correct_edge = edges.filter(screen_work__title='Twilight', screen_work__year=2008).first()
                    if correct_edge:
                        print(f'  Keeping: {correct_edge.screen_work.title} (2008)')
                        edges.exclude(id=correct_edge.id).delete()
                        print(f'  Deleted {edges.count() - 1} incorrect edges')

                elif book_title == 'The Hunger Games' and book.author == 'Suzanne Collins':
                    # Keep only the 2012 Hunger Games movie
                    correct_edge = edges.filter(screen_work__title='The Hunger Games', screen_work__year=2012).first()
                    if correct_edge:
                        print(f'  Keeping: {correct_edge.screen_work.title} (2012)')
                        edges.exclude(id=correct_edge.id).delete()
                        print(f'  Deleted {edges.count() - 1} incorrect edges')

                elif book_title in ['The Lord of the Rings', 'The Hobbit']:
                    # These are omnibus - all edges are technically correct
                    # But we've created individual books, so we can optionally clean these
                    print(f'  Omnibus book - edges are technically valid')
                    print(f'  (Individual books created for each movie)')


if __name__ == '__main__':
    create_series_books()
    cleanup_incorrect_mappings()
    print('\n\nDone!')
