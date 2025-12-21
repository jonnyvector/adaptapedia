#!/usr/bin/env python
"""
Script to check available books and screen works in the database.

Usage:
    docker-compose exec backend python scripts/check_database.py
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
from screen.models import ScreenWork


def check_database():
    """Check what's in the database."""

    print("="*60)
    print("DATABASE CONTENTS")
    print("="*60)

    # Count totals
    total_books = Work.objects.count()
    total_screen = ScreenWork.objects.count()

    print(f"\nTotal Books: {total_books}")
    print(f"Total Screen Works: {total_screen}")

    # Sample books
    print("\n" + "="*60)
    print("SAMPLE BOOKS (First 20):")
    print("="*60)
    for w in Work.objects.all()[:20]:
        print(f"  - {w.title} ({w.year or 'N/A'})")

    # Sample screen works
    print("\n" + "="*60)
    print("SAMPLE SCREEN WORKS (First 20):")
    print("="*60)
    for sw in ScreenWork.objects.all()[:20]:
        print(f"  - {sw.title} ({sw.year or 'N/A'})")

    # Search for specific titles
    print("\n" + "="*60)
    print("SEARCHING FOR POPULAR ADAPTATIONS:")
    print("="*60)

    search_titles = [
        ("Lord of the Rings", "Fellowship"),
        ("Harry Potter", "Philosopher"),
        ("Hunger Games", "Hunger Games"),
        ("Gone Girl", "Gone Girl"),
        ("The Martian", "Martian"),
        ("Dune", "Dune"),
        ("The Shining", "Shining"),
        ("Blade Runner", "Androids Dream"),
        ("Jurassic Park", "Jurassic"),
        ("Sphere", "Sphere"),
    ]

    for book_search, screen_search in search_titles:
        books = Work.objects.filter(title__icontains=book_search)
        screens = ScreenWork.objects.filter(title__icontains=screen_search)

        if books.exists() or screens.exists():
            print(f"\n{book_search}:")
            if books.exists():
                print(f"  Books found: {books.count()}")
                for b in books[:3]:
                    print(f"    - {b.title} ({b.year or 'N/A'})")
            else:
                print(f"  Books found: 0")

            if screens.exists():
                print(f"  Screen works found: {screens.count()}")
                for s in screens[:3]:
                    print(f"    - {s.title} ({s.year or 'N/A'})")
            else:
                print(f"  Screen works found: 0")


if __name__ == '__main__':
    check_database()
