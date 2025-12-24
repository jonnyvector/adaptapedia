#!/usr/bin/env python
"""Test script for reputation and badge system."""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')
django.setup()

from users.models import User, UserBadge, ReputationEvent, Notification
from diffs.models import DiffItem, DiffVote
from users.services import BadgeService, ReputationService, NotificationService
from django.db.models import Count, Case, When, F

def main():
    print("=" * 60)
    print("REPUTATION & BADGE SYSTEM TEST")
    print("=" * 60)

    # 1. Get a test user
    test_user = User.objects.filter(username='book_fan').first()
    if not test_user:
        print("❌ Test user 'book_fan' not found")
        return

    print(f"\n1️⃣  Testing with user: {test_user.username}")
    print(f"   Initial reputation: {test_user.reputation_points}")
    print(f"   Initial badges: {test_user.badges.count()}")

    # 2. Get a diff to vote on
    diff = DiffItem.objects.filter(status='LIVE').first()
    if not diff:
        print("❌ No diffs found to test with")
        return

    print(f"\n2️⃣  Found diff to vote on: \"{diff.claim[:50]}...\"")
    print(f"   Created by: {diff.created_by.username}")

    # 3. Cast a vote (first vote should award FIRST_VOTE badge)
    print(f"\n3️⃣  Casting ACCURATE vote...")
    vote, created = DiffVote.objects.update_or_create(
        diff_item=diff,
        user=test_user,
        defaults={'vote': 'ACCURATE'}
    )

    if created:
        print("   ✓ Vote created")
        # Check for milestone badges
        badges_awarded = BadgeService.check_milestone_badges(test_user)
        if badges_awarded:
            print(f"   ✓ Badges awarded: {[b.get_badge_type_display() for b in badges_awarded]}")
        else:
            print("   ⚠ No badges awarded (might already have them)")
    else:
        print("   ⚠ Vote already existed")

    # 4. Check user's badges
    test_user.refresh_from_db()
    print(f"\n4️⃣  Current badges for {test_user.username}:")
    for badge in test_user.badges.all():
        print(f"   🏅 {badge.get_badge_type_display()} - earned {badge.earned_at.strftime('%Y-%m-%d')}")

    # 5. Test diff consensus (simulate reaching consensus)
    print(f"\n5️⃣  Testing consensus calculation for diff...")
    diff_with_votes = DiffItem.objects.filter(pk=diff.pk).annotate(
        accurate_count=Count(
            Case(When(votes__vote='ACCURATE', then=1)),
            distinct=True
        ),
        disagree_count=Count(
            Case(When(votes__vote='DISAGREE', then=1)),
            distinct=True
        ),
        nuance_count=Count(
            Case(When(votes__vote='NEEDS_NUANCE', then=1)),
            distinct=True
        ),
        total_votes=F('accurate_count') + F('disagree_count') + F('nuance_count'),
    ).first()

    print(f"   Accurate: {diff_with_votes.accurate_count}")
    print(f"   Disagree: {diff_with_votes.disagree_count}")
    print(f"   Nuance: {diff_with_votes.nuance_count}")
    print(f"   Total votes: {diff_with_votes.total_votes}")

    if diff_with_votes.total_votes >= 10:
        print("   ✓ Diff has enough votes for consensus!")
        consensus_type = ReputationService.calculate_diff_consensus_rep(diff_with_votes)
        if consensus_type:
            print(f"   Consensus type: {consensus_type}")

            # Award reputation to diff creator
            rep_event = ReputationService.award_reputation(
                user=diff.created_by,
                event_type=consensus_type,
                description=f"Diff reached consensus: {diff.claim}",
                diff_item=diff
            )
            if rep_event:
                print(f"   ✓ Awarded {rep_event.amount} rep to {diff.created_by.username}")

                # Check creator's new reputation
                diff.created_by.refresh_from_db()
                print(f"   New reputation for {diff.created_by.username}: {diff.created_by.reputation_points}")
    else:
        print(f"   ⚠ Only {diff_with_votes.total_votes} votes (need 10 for consensus)")

    # 6. Check reputation events
    print(f"\n6️⃣  Recent reputation events:")
    events = ReputationEvent.objects.all()[:10]
    if events:
        for event in events:
            print(f"   {event.user.username}: {'+' if event.amount >= 0 else ''}{event.amount} - {event.get_event_type_display()}")
    else:
        print("   No reputation events yet")

    # 7. Check notifications
    print(f"\n7️⃣  Recent notifications:")
    notifications = Notification.objects.all()[:5]
    if notifications:
        for notif in notifications:
            read_status = "✓ Read" if notif.is_read else "⚪ Unread"
            print(f"   [{read_status}] {notif.user.username}: {notif.title}")
    else:
        print("   No notifications yet")

    # 8. Test user stats
    print(f"\n8️⃣  User stats for {test_user.username}:")
    stats = ReputationService.get_user_stats(test_user)
    print(f"   Reputation: {stats['reputation']}")
    print(f"   Total diffs: {stats['total_diffs']}")
    print(f"   Total votes: {stats['total_votes']}")
    print(f"   Total comments: {stats['total_comments']}")
    if stats['accuracy_rate']:
        print(f"   Accuracy rate: {stats['accuracy_rate']}%")
    else:
        print(f"   Accuracy rate: N/A (no evaluated diffs)")

    # 9. Test quality badges
    print(f"\n9️⃣  Checking quality badges for diff creators...")
    for user in User.objects.all()[:3]:
        quality_badges = BadgeService.check_quality_badges(user)
        if quality_badges:
            print(f"   ✓ {user.username}: {[b.get_badge_type_display() for b in quality_badges]}")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    main()
