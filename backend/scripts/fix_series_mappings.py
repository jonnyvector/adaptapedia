#!/usr/bin/env python
"""Fix book series mappings - create individual books and map them to correct movies."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')
django.setup()

from works.models import Work
from screen.models import ScreenWork, AdaptationEdge
from works.services import WorkService
from screen.services import AdaptationEdgeService

# Manual mappings for popular series (Wikidata QIDs)
# Format: (book_qid, book_title, movie_qid, movie_title)
SERIES_MAPPINGS = [
    # Twilight series
    ('Q160071', 'Twilight', 'Q160071', 'Twilight'),  # Book 1 → Movie 1
    ('Q160071', 'New Moon', 'Q116928', 'The Twilight Saga: New Moon'),  # Book 2 → Movie 2
    ('Q147787', 'Eclipse', 'Q116928', 'The Twilight Saga: Eclipse'),  # Book 3 → Movie 3
    ('Q191527', 'Breaking Dawn', 'Q116928', 'The Twilight Saga: Breaking Dawn - Part 1'),  # Book 4 → Movie 4
    ('Q191527', 'Breaking Dawn', 'Q116928', 'The Twilight Saga: Breaking Dawn - Part 2'),  # Book 4 → Movie 5

    # Harry Potter series
    ('Q43361', "Harry Potter and the Philosopher's Stone", 'Q102438', "Harry Potter and the Philosopher's Stone"),
    ('Q47209', 'Harry Potter and the Chamber of Secrets', 'Q102244', 'Harry Potter and the Chamber of Secrets'),
    ('Q47598', 'Harry Potter and the Prisoner of Azkaban', 'Q102225', 'Harry Potter and the Prisoner of Azkaban'),
    ('Q46887', 'Harry Potter and the Goblet of Fire', 'Q102235', 'Harry Potter and the Goblet of Fire'),
    ('Q47480', 'Harry Potter and the Order of the Phoenix', 'Q102187', 'Harry Potter and the Order of the Phoenix'),
    ('Q46758', 'Harry Potter and the Half-Blood Prince', 'Q102235', 'Harry Potter and the Half-Blood Prince'),
    ('Q46756', 'Harry Potter and the Deathly Hallows', 'Q232009', 'Harry Potter and the Deathly Hallows – Part 1'),
    ('Q46756', 'Harry Potter and the Deathly Hallows', 'Q232009', 'Harry Potter and the Deathly Hallows – Part 2'),

    # The Hunger Games
    ('Q11679', 'The Hunger Games', 'Q212965', 'The Hunger Games'),
    ('Q837140', 'Catching Fire', 'Q837140', 'The Hunger Games: Catching Fire'),
    ('Q11678', 'Mockingjay', 'Q11678', 'The Hunger Games: Mockingjay - Part 1'),
    ('Q11678', 'Mockingjay', 'Q11678', 'The Hunger Games: Mockingjay - Part 2'),

    # Lord of the Rings
    ('Q15228', 'The Fellowship of the Ring', 'Q127367', 'The Lord of the Rings: The Fellowship of the Ring'),
    ('Q15228', 'The Two Towers', 'Q164963', 'The Lord of the Rings: The Two Towers'),
    ('Q15228', 'The Return of the King', 'Q131074', 'The Lord of the Rings: The Return of the King'),

    # The Hobbit
    ('Q74331', 'The Hobbit', 'Q80379', 'The Hobbit: An Unexpected Journey'),
    ('Q74331', 'The Hobbit', 'Q80379', 'The Hobbit: The Desolation of Smaug'),
    ('Q74331', 'The Hobbit', 'Q80379', 'The Hobbit: The Battle of the Five Armies'),
]

def fix_series():
    """Fix book series mappings by querying titles from existing movies."""
    print('Fixing series book-to-movie mappings...\n')

    series_books = {
        'Twilight': ['Twilight', 'New Moon', 'Eclipse', 'Breaking Dawn'],
        'Harry Potter': [
            "Harry Potter and the Philosopher's Stone",
            "Harry Potter and the Sorcerer's Stone",
            'Harry Potter and the Chamber of Secrets',
            'Harry Potter and the Prisoner of Azkaban',
            'Harry Potter and the Goblet of Fire',
            'Harry Potter and the Order of the Phoenix',
            'Harry Potter and the Half-Blood Prince',
            'Harry Potter and the Deathly Hallows',
        ],
        'The Hunger Games': ['The Hunger Games', 'Catching Fire', 'Mockingjay'],
    }

    for series_name, book_titles in series_books.items():
        print(f'\n=== {series_name} ===')

        # Find movies for this series
        movies = ScreenWork.objects.filter(title__icontains=series_name.split()[0])
        print(f'Found {movies.count()} movies')

        for movie in movies:
            print(f'\n  Movie: {movie.title} ({movie.year})')

            # Try to match movie to book by title
            matched = False
            for book_title in book_titles:
                # Simple matching - if book title words appear in movie title
                book_words = set(book_title.lower().replace("'", '').split())
                movie_words = set(movie.title.lower().replace("'", '').replace(':', '').split())

                # Check for significant overlap
                if len(book_words & movie_words) >= min(2, len(book_words)):
                    print(f'    → Matched to book: {book_title}')

                    # Find or create the book
                    book = Work.objects.filter(title=book_title, author__icontains='Meyer' if 'Twilight' in series_name else ('Rowling' if 'Potter' in series_name else 'Collins')).first()

                    if not book:
                        print(f'      Creating book: {book_title}')
                        author = 'Stephenie Meyer' if 'Twilight' in series_name else ('J.K. Rowling' if 'Potter' in series_name else 'Suzanne Collins')
                        book = Work.objects.create(
                            title=book_title,
                            author=author,
                        )

                    # Check if edge already exists
                    edge_exists = AdaptationEdge.objects.filter(work=book, screen_work=movie).exists()

                    if not edge_exists:
                        print(f'      Creating adaptation edge')
                        AdaptationEdge.objects.create(
                            work=book,
                            screen_work=movie,
                            source='MANUAL',
                        )
                    else:
                        print(f'      Edge already exists')

                    matched = True
                    break

            if not matched:
                print(f'    ⚠ Could not match to any book')

    # Clean up old incorrect mappings
    print('\n\n=== Cleaning up incorrect mappings ===')

    # Find books with too many adaptations
    problem_books = [
        ('Twilight', 1),  # Should only map to first movie
        ('The Hunger Games', 1),  # Should only map to first movie
        ('The Lord of the Rings', 0),  # Should not exist as single book
        ('The Hobbit', 0),  # Should not exist as single book
    ]

    for book_title, max_adaptations in problem_books:
        books = Work.objects.filter(title=book_title)
        for book in books:
            edges = AdaptationEdge.objects.filter(work=book)
            if edges.count() > max_adaptations:
                print(f'\n{book.title} has {edges.count()} adaptations (should have {max_adaptations})')
                print('  Current mappings:')
                for edge in edges:
                    print(f'    → {edge.screen_work.title} ({edge.screen_work.year})')

                if max_adaptations == 0:
                    print(f'  Deleting all edges for omnibus book')
                    edges.delete()
                elif max_adaptations == 1:
                    # Keep only the first matching movie, delete others
                    first_edge = edges.first()
                    print(f'  Keeping: {first_edge.screen_work.title}')
                    print(f'  Deleting {edges.count() - 1} other edges')
                    edges.exclude(id=first_edge.id).delete()

if __name__ == '__main__':
    fix_series()
    print('\n\nDone!')
