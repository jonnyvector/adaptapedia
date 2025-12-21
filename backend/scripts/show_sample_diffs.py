#!/usr/bin/env python
"""
Display sample diffs created by create_sample_comparisons.py

Usage:
    docker-compose exec backend python scripts/show_sample_diffs.py
"""

import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from diffs.models import DiffItem
from django.db.models import Count


def show_diffs():
    """Display all diffs in a nice format."""

    print("="*80)
    print("SAMPLE BOOK-TO-SCREEN COMPARISONS")
    print("="*80)

    # Get unique comparisons
    comparisons = {}
    for diff in DiffItem.objects.select_related('work', 'screen_work').all():
        key = (diff.work.id, diff.screen_work.id)
        if key not in comparisons:
            comparisons[key] = {
                'work': diff.work,
                'screen_work': diff.screen_work,
                'diffs': []
            }
        comparisons[key]['diffs'].append(diff)

    # Display each comparison
    for idx, (key, data) in enumerate(sorted(comparisons.items(), key=lambda x: x[1]['work'].title), 1):
        work = data['work']
        screen = data['screen_work']
        diffs = data['diffs']

        print(f"\n{'='*80}")
        print(f"{idx}. {work.title} → {screen.title}")
        print(f"{'='*80}")
        print(f"Total diffs: {len(diffs)}")
        print(f"Work year: {work.year or 'N/A'}")
        print(f"Screen year: {screen.year or 'N/A'}")
        print(f"Screen type: {screen.get_type_display()}")

        # Category breakdown for this comparison
        categories = {}
        spoilers = {}
        for diff in diffs:
            categories[diff.category] = categories.get(diff.category, 0) + 1
            spoilers[diff.spoiler_scope] = spoilers.get(diff.spoiler_scope, 0) + 1

        print(f"\nCategories: {', '.join(f'{k}({v})' for k, v in sorted(categories.items()))}")
        print(f"Spoilers: {', '.join(f'{k}({v})' for k, v in sorted(spoilers.items()))}")

        # Show 3 sample diffs
        print(f"\nSample diffs:")
        print("-" * 80)

        for i, diff in enumerate(diffs[:3], 1):
            votes = diff.vote_counts
            total = votes['accurate'] + votes['needs_nuance'] + votes['disagree']

            print(f"\n  {i}. [{diff.get_category_display()}] {diff.claim}")
            print(f"     Spoiler: {diff.get_spoiler_scope_display()}")
            if diff.detail:
                detail = diff.detail[:120] + '...' if len(diff.detail) > 120 else diff.detail
                print(f"     Detail: {detail}")
            print(f"     Votes: ✓{votes['accurate']} ~{votes['needs_nuance']} ✗{votes['disagree']} (total: {total})")

        if len(diffs) > 3:
            print(f"\n  ... and {len(diffs) - 3} more diffs")

    # Overall statistics
    print("\n" + "="*80)
    print("OVERALL STATISTICS")
    print("="*80)

    total_diffs = DiffItem.objects.count()
    total_votes = sum(
        diff.vote_counts['accurate'] + diff.vote_counts['needs_nuance'] + diff.vote_counts['disagree']
        for diff in DiffItem.objects.all()
    )

    print(f"\nTotal comparisons: {len(comparisons)}")
    print(f"Total diffs: {total_diffs}")
    print(f"Total votes: {total_votes}")
    print(f"Average votes per diff: {total_votes / total_diffs:.1f}")

    # Category totals
    print("\nDiffs by category:")
    categories = DiffItem.objects.values('category').annotate(count=Count('id')).order_by('-count')
    for cat in categories:
        print(f"  {cat['category']}: {cat['count']}")

    # Spoiler scope totals
    print("\nDiffs by spoiler scope:")
    scopes = DiffItem.objects.values('spoiler_scope').annotate(count=Count('id')).order_by('-count')
    for scope in scopes:
        print(f"  {scope['spoiler_scope']}: {scope['count']}")


if __name__ == '__main__':
    show_diffs()
