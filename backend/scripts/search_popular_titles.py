#!/usr/bin/env python
"""
Script to search for popular book-to-screen adaptations in the database.

Usage:
    docker-compose exec backend python scripts/search_popular_titles.py
"""

import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from works.models import Work
from screen.models import ScreenWork, AdaptationEdge


def search_titles():
    """Search for specific popular titles."""

    # Expanded search list with more variations
    search_variations = {
        "Lord of the Rings": ["Lord of the Rings", "Fellowship of the Ring", "Two Towers", "Return of the King"],
        "Harry Potter": ["Harry Potter", "Philosopher's Stone", "Sorcerer's Stone", "Chamber of Secrets", "Prisoner of Azkaban"],
        "Hunger Games": ["Hunger Games", "Mockingjay", "Catching Fire"],
        "Gone Girl": ["Gone Girl"],
        "The Martian": ["Martian"],
        "Dune": ["Dune"],
        "The Shining": ["Shining"],
        "Blade Runner": ["Blade Runner", "Androids Dream of Electric Sheep"],
        "Fight Club": ["Fight Club"],
        "The Godfather": ["Godfather"],
        "Forrest Gump": ["Forrest Gump"],
        "The Silence of the Lambs": ["Silence of the Lambs", "Red Dragon", "Hannibal"],
        "The Green Mile": ["Green Mile"],
        "Shawshank Redemption": ["Shawshank", "Rita Hayworth"],
        "The Notebook": ["Notebook"],
        "Pride and Prejudice": ["Pride and Prejudice"],
        "The Great Gatsby": ["Great Gatsby"],
        "1984": ["Nineteen Eighty-Four", "1984"],
        "Brave New World": ["Brave New World"],
        "To Kill a Mockingbird": ["Kill a Mockingbird"],
        "The Hobbit": ["Hobbit"],
        "Chronicles of Narnia": ["Narnia", "Lion, the Witch"],
        "Twilight": ["Twilight", "Breaking Dawn", "New Moon", "Eclipse"],
        "Game of Thrones": ["Game of Thrones", "Song of Ice and Fire"],
        "The Handmaid's Tale": ["Handmaid's Tale"],
        "Big Little Lies": ["Big Little Lies"],
        "The Witcher": ["Witcher"],
        "Percy Jackson": ["Percy Jackson", "Lightning Thief"],
        "Divergent": ["Divergent"],
        "Maze Runner": ["Maze Runner"],
        "Ender's Game": ["Ender's Game"],
        "Ready Player One": ["Ready Player One"],
        "The Princess Bride": ["Princess Bride"],
        "Stardust": ["Stardust"],
        "Coraline": ["Coraline"],
        "The Lovely Bones": ["Lovely Bones"],
        "Life of Pi": ["Life of Pi"],
        "Slumdog Millionaire": ["Slumdog Millionaire", "Q & A"],
        "No Country for Old Men": ["No Country for Old Men"],
        "There Will Be Blood": ["There Will Be Blood", "Oil!"],
        "The Road": ["The Road"],
    }

    print("="*70)
    print("SEARCHING FOR POPULAR BOOK-TO-SCREEN ADAPTATIONS")
    print("="*70)

    found_pairs = []
    found_books_only = []
    found_screens_only = []

    for title_group, variations in search_variations.items():
        books = None
        screens = None

        for variation in variations:
            if not books:
                books = Work.objects.filter(title__icontains=variation)
            if not screens:
                screens = ScreenWork.objects.filter(title__icontains=variation)

            if books.exists() and screens.exists():
                break

        if books and books.exists() and screens and screens.exists():
            found_pairs.append((title_group, books, screens))
            print(f"\n✓ {title_group}:")
            print(f"  Books: {books.count()} found")
            for b in books[:2]:
                print(f"    - {b.title} ({b.year or 'N/A'})")
            print(f"  Screen works: {screens.count()} found")
            for s in screens[:2]:
                print(f"    - {s.title} ({s.year or 'N/A'})")
        elif books and books.exists():
            found_books_only.append((title_group, books))
        elif screens and screens.exists():
            found_screens_only.append((title_group, screens))

    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)
    print(f"\nComplete pairs (book + screen): {len(found_pairs)}")
    print(f"Books only (no matching screen work): {len(found_books_only)}")
    print(f"Screen works only (no matching book): {len(found_screens_only)}")

    if found_books_only:
        print("\nBooks without matching screen works:")
        for title, books in found_books_only[:5]:
            print(f"  - {title}: {books.first().title}")

    if found_screens_only:
        print("\nScreen works without matching books:")
        for title, screens in found_screens_only[:5]:
            print(f"  - {title}: {screens.first().title}")

    # Check adaptation edges
    print("\n" + "="*70)
    print("ADAPTATION EDGES")
    print("="*70)
    edges = AdaptationEdge.objects.all()
    print(f"Total adaptation edges: {edges.count()}")
    if edges.exists():
        print("\nSample adaptation edges:")
        for edge in edges[:10]:
            print(f"  - {edge.screen_work.title} → {edge.work.title}")

    return found_pairs


if __name__ == '__main__':
    search_titles()
