#!/usr/bin/env python
"""
Script to create test items for moderation queue testing.

Usage:
    docker-compose exec backend python scripts/create_test_moderation_items.py
"""

import os
import sys
import django

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from diffs.models import DiffItem, DiffComment
from works.models import Work
from screen.models import ScreenWork
from users.models import User


def create_test_items():
    """Create test pending items for moderation."""

    # Get or create a test user
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={
            'email': 'test@example.com',
            'role': 'USER'
        }
    )
    if created:
        user.set_password('testpass123')
        user.save()
        print(f"✓ Created test user: {user.username}")
    else:
        print(f"✓ Using existing user: {user.username}")

    # Get first work and screen work for testing
    work = Work.objects.first()
    screen_work = ScreenWork.objects.first()

    if not work or not screen_work:
        print("✗ Error: No works or screen works found in database")
        print("  Please add some works and screen works first")
        return

    # Create pending diffs
    pending_diffs_created = 0
    flagged_diffs_created = 0

    # Create 3 pending diffs
    for i in range(1, 4):
        diff, created = DiffItem.objects.get_or_create(
            work=work,
            screen_work=screen_work,
            claim=f'Test pending diff #{i} for moderation queue',
            defaults={
                'category': 'PLOT' if i % 2 == 0 else 'CHARACTER',
                'detail': f'This is test diff #{i} with pending status. It should appear in the moderation queue for review.',
                'spoiler_scope': 'NONE' if i % 2 == 0 else 'FULL',
                'status': 'PENDING',
                'created_by': user
            }
        )
        if created:
            pending_diffs_created += 1

    # Create 2 flagged diffs
    for i in range(1, 3):
        diff, created = DiffItem.objects.get_or_create(
            work=work,
            screen_work=screen_work,
            claim=f'Test flagged diff #{i} needs review',
            defaults={
                'category': 'ENDING' if i % 2 == 0 else 'THEME',
                'detail': f'This is test diff #{i} with flagged status. It was flagged for further review.',
                'spoiler_scope': 'BOOK_ONLY',
                'status': 'FLAGGED',
                'created_by': user
            }
        )
        if created:
            flagged_diffs_created += 1

    print(f"✓ Created {pending_diffs_created} pending diffs")
    print(f"✓ Created {flagged_diffs_created} flagged diffs")

    # Create pending comments
    # Find a live diff to comment on
    live_diff = DiffItem.objects.filter(status='LIVE').first()

    if not live_diff:
        # Create a live diff for comments
        live_diff = DiffItem.objects.create(
            work=work,
            screen_work=screen_work,
            category='PLOT',
            claim='Live diff for testing comments',
            detail='This diff is live and can have comments.',
            spoiler_scope='NONE',
            status='LIVE',
            created_by=user
        )
        print(f"✓ Created live diff for comments: #{live_diff.id}")

    pending_comments_created = 0

    # Create 3 pending comments
    for i in range(1, 4):
        comment, created = DiffComment.objects.get_or_create(
            diff_item=live_diff,
            user=user,
            body=f'This is test pending comment #{i}. It should appear in the moderation queue.',
            defaults={
                'spoiler_scope': 'NONE' if i % 2 == 0 else 'FULL',
                'status': 'PENDING'
            }
        )
        if created:
            pending_comments_created += 1

    print(f"✓ Created {pending_comments_created} pending comments")

    # Summary
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Total Pending Diffs: {DiffItem.objects.filter(status='PENDING').count()}")
    print(f"Total Flagged Diffs: {DiffItem.objects.filter(status='FLAGGED').count()}")
    print(f"Total Pending Comments: {DiffComment.objects.filter(status='PENDING').count()}")
    print("\nYou can now test the moderation queue at /mod/queue")
    print("\nTo create a moderator user, run:")
    print("  docker-compose exec backend python manage.py shell")
    print("  >>> from users.models import User")
    print("  >>> user = User.objects.get(username='your_username')")
    print("  >>> user.role = 'MOD'")
    print("  >>> user.save()")


if __name__ == '__main__':
    print("Creating test moderation items...\n")
    create_test_items()
