#!/usr/bin/env python
"""
Script to find the best adaptations for creating sample diffs.

Usage:
    docker-compose exec backend python scripts/find_best_adaptations.py
"""

import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from screen.models import AdaptationEdge
from diffs.models import DiffItem


def find_adaptations():
    """Find adaptations suitable for sample diffs."""

    print("="*70)
    print("FINDING SUITABLE ADAPTATIONS FOR SAMPLE DIFFS")
    print("="*70)

    # Get all adaptation edges
    edges = AdaptationEdge.objects.select_related('work', 'screen_work').all()

    print(f"\nTotal adaptation edges: {edges.count()}")

    # Popular Western adaptations to look for
    western_keywords = [
        "lord of the rings", "fellowship", "two towers", "return of the king",
        "harry potter", "philosopher", "sorcerer", "chamber", "prisoner",
        "hunger games", "catching fire", "mockingjay",
        "gone girl",
        "martian",
        "dune",
        "shining",
        "blade runner",
        "fight club",
        "godfather",
        "forrest gump",
        "silence of the lambs",
        "green mile",
        "shawshank",
        "notebook",
        "pride and prejudice",
        "great gatsby",
        "1984", "nineteen eighty",
        "brave new world",
        "mockingbird",
        "hobbit",
        "narnia",
        "twilight",
        "game of thrones",
        "handmaid",
        "witcher",
        "percy jackson",
        "divergent",
        "maze runner",
        "ender's game",
        "ready player one",
        "princess bride",
        "coraline",
        "lovely bones",
        "life of pi",
        "slumdog",
        "no country for old men",
        "there will be blood",
        "road",
    ]

    print("\n" + "="*70)
    print("SEARCHING FOR WESTERN ADAPTATIONS")
    print("="*70)

    found_western = []

    for edge in edges:
        book_title = edge.work.title.lower()
        screen_title = edge.screen_work.title.lower()

        for keyword in western_keywords:
            if keyword in book_title or keyword in screen_title:
                found_western.append(edge)
                print(f"\n✓ Found: {edge.work.title} → {edge.screen_work.title}")
                print(f"  Book year: {edge.work.year or 'N/A'}")
                print(f"  Screen year: {edge.screen_work.year or 'N/A'}")
                print(f"  Screen type: {edge.screen_work.get_type_display()}")
                break

    # Show most popular/recognizable adaptations
    print("\n" + "="*70)
    print("ALL ADAPTATIONS (alphabetically, first 50)")
    print("="*70)

    all_edges = list(edges.order_by('work__title')[:50])
    for edge in all_edges:
        print(f"  - {edge.work.title} ({edge.work.year or 'N/A'}) → {edge.screen_work.title} ({edge.screen_work.year or 'N/A'})")

    # Check for existing diffs
    print("\n" + "="*70)
    print("EXISTING DIFFS")
    print("="*70)

    diffs = DiffItem.objects.select_related('work', 'screen_work').all()
    print(f"\nTotal diffs: {diffs.count()}")

    if diffs.exists():
        print("\nComparisons with diffs:")
        existing_comparisons = {}
        for diff in diffs:
            key = (diff.work.id, diff.screen_work.id)
            if key not in existing_comparisons:
                existing_comparisons[key] = {
                    'work': diff.work,
                    'screen_work': diff.screen_work,
                    'count': 0
                }
            existing_comparisons[key]['count'] += 1

        for key, data in existing_comparisons.items():
            print(f"  - {data['work'].title} → {data['screen_work'].title}: {data['count']} diffs")

    print("\n" + "="*70)
    print("RECOMMENDATIONS")
    print("="*70)

    if found_western:
        print(f"\nFound {len(found_western)} Western adaptations!")
        print("\nRecommended for sample diffs:")
        for edge in found_western[:5]:
            print(f"  - {edge.work.title} → {edge.screen_work.title}")
    else:
        print("\nNo Western adaptations found. Using available adaptations:")
        print("\nRecommended (most recognizable):")
        for edge in all_edges[:10]:
            print(f"  - {edge.work.title} → {edge.screen_work.title}")


if __name__ == '__main__':
    find_adaptations()
