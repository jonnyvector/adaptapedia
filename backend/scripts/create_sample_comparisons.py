#!/usr/bin/env python
"""
Create sample book/screen comparisons with detailed diffs.

This script creates comprehensive diffs for 4 popular adaptations:
- Death Note (manga → movie)
- Akira (manga → movie)
- Over the Hedge (comic → movie)
- Cardcaptor Sakura (manga → anime)

Each comparison includes 8-12 diffs covering various categories with realistic votes.

Usage:
    docker-compose exec backend python scripts/create_sample_comparisons.py
"""

import os
import sys
import django
from random import randint, choice

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from works.models import Work
from screen.models import ScreenWork
from diffs.models import DiffItem, DiffVote
from users.models import User


def get_or_create_test_users():
    """Create test users for voting."""
    users = []
    user_data = [
        ('admin', 'admin@adaptapedia.com', 'ADMIN'),
        ('movie_buff', 'movie@example.com', 'USER'),
        ('book_lover', 'books@example.com', 'USER'),
        ('anime_fan', 'anime@example.com', 'USER'),
        ('critic_jane', 'jane@example.com', 'USER'),
        ('reader_bob', 'bob@example.com', 'USER'),
    ]

    for username, email, role in user_data:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': role,
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"  ✓ Created user: {username}")
        users.append(user)

    return users


def add_votes_to_diff(diff, users, accurate_weight=70, nuance_weight=20, disagree_weight=10):
    """Add realistic votes to a diff item."""
    # Determine how many users will vote (2-5 users typically)
    num_voters = randint(2, min(5, len(users)))
    voters = []

    for _ in range(num_voters):
        user = choice([u for u in users if u not in voters])
        voters.append(user)

        # Weighted random vote
        rand = randint(1, 100)
        if rand <= accurate_weight:
            vote_type = 'ACCURATE'
        elif rand <= accurate_weight + nuance_weight:
            vote_type = 'NEEDS_NUANCE'
        else:
            vote_type = 'DISAGREE'

        DiffVote.objects.get_or_create(
            diff_item=diff,
            user=user,
            defaults={'vote': vote_type}
        )


def create_death_note_diffs(admin_user, users):
    """Create diffs for Death Note manga → movie comparison."""

    print("\n" + "="*70)
    print("DEATH NOTE (Manga → Movie)")
    print("="*70)

    try:
        book = Work.objects.get(title__iexact="Death Note")
        movie = ScreenWork.objects.get(title__iexact="Death Note", type='MOVIE')
    except (Work.DoesNotExist, ScreenWork.DoesNotExist, ScreenWork.MultipleObjectsReturned):
        # Try alternative query
        try:
            book = Work.objects.filter(title__icontains="Death Note").first()
            movie = ScreenWork.objects.filter(title__icontains="Death Note", type='MOVIE').first()
        except Exception as e:
            print(f"  ✗ Could not find Death Note: {e}")
            return 0

    if not book or not movie:
        print("  ✗ Death Note not found in database")
        return 0

    print(f"  ✓ Found: {book.title} → {movie.title}")

    diffs_data = [
        {
            'category': 'CHARACTER',
            'claim': 'L\'s personality is less eccentric in the live-action film',
            'detail': 'The manga portrays L as highly eccentric with peculiar eating habits, unusual sitting positions, and childlike mannerisms. The movie tones down these quirks to make the character more conventionally serious and detective-like.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),  # (accurate, nuance, disagree)
        },
        {
            'category': 'PLOT',
            'claim': 'The movie compresses the timeline significantly',
            'detail': 'The manga\'s story unfolds over several months with detailed planning and counter-planning. The movie condenses this to a much shorter timeframe, removing many of the intricate cat-and-mouse games between Light and L.',
            'spoiler_scope': 'NONE',
            'votes': (90, 5, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Misa Amane has a reduced role in the film',
            'detail': 'In the manga, Misa is a crucial character with complex motivations and significant impact on the plot. The movie reduces her to a more minor supporting role, cutting much of her character development and importance to the story.',
            'spoiler_scope': 'NONE',
            'votes': (85, 10, 5),
        },
        {
            'category': 'PLOT',
            'claim': 'The Yotsuba arc is completely omitted',
            'detail': 'The manga features an extensive Yotsuba Corporation storyline where Light temporarily gives up the Death Note. This entire arc, which comprises a significant portion of the manga, is absent from the movie adaptation.',
            'spoiler_scope': 'BOOK_ONLY',
            'votes': (95, 5, 0),
        },
        {
            'category': 'ENDING',
            'claim': 'The ending is completely different',
            'detail': 'The manga ends with Light\'s elaborate plan unraveling in a dramatic warehouse confrontation, where he is shot and dies pathetically. The movie has a different conclusion that simplifies the finale and changes the outcome of the L vs Light confrontation.',
            'spoiler_scope': 'FULL',
            'votes': (90, 8, 2),
        },
        {
            'category': 'TONE',
            'claim': 'The film has a more grounded, realistic tone',
            'detail': 'While the manga embraces dramatic, almost theatrical moments with exaggerated reactions and stylized visuals, the movie opts for a more realistic, subdued approach to the supernatural thriller genre.',
            'spoiler_scope': 'NONE',
            'votes': (75, 20, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Ryuk appears less frequently in the movie',
            'detail': 'The shinigami Ryuk has constant presence and commentary throughout the manga, serving as both comic relief and philosophical counterpoint. In the movie, his appearances are more limited, reducing his role in the narrative.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'PLOT',
            'claim': 'Many secondary characters are cut entirely',
            'detail': 'Characters like Naomi Misora, Matt, and Wedy who play important roles in the manga are either completely absent or have minimal presence in the film, streamlining the cast.',
            'spoiler_scope': 'NONE',
            'votes': (85, 10, 5),
        },
        {
            'category': 'SETTING',
            'claim': 'The scope of the story is more localized',
            'detail': 'The manga presents Kira as a global phenomenon with international investigation teams and worldwide impact. The movie focuses primarily on Japan, reducing the global scale of the story.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'THEME',
            'claim': 'The moral ambiguity is less explored',
            'detail': 'The manga extensively examines the ethical questions of justice, power, and playing god through nuanced character perspectives. The film presents a more straightforward good vs evil narrative with less philosophical depth.',
            'spoiler_scope': 'NONE',
            'votes': (70, 25, 5),
        },
    ]

    created_count = 0
    for diff_data in diffs_data:
        votes = diff_data.pop('votes')
        diff, created = DiffItem.objects.get_or_create(
            work=book,
            screen_work=movie,
            claim=diff_data['claim'],
            defaults={
                **diff_data,
                'created_by': admin_user,
                'status': 'LIVE',
            }
        )
        if created:
            add_votes_to_diff(diff, users, *votes)
            created_count += 1
            print(f"  ✓ Created diff: {diff.claim[:60]}...")

    return created_count


def create_akira_diffs(admin_user, users):
    """Create diffs for Akira manga → movie comparison."""

    print("\n" + "="*70)
    print("AKIRA (Manga → Movie)")
    print("="*70)

    try:
        book = Work.objects.get(title__iexact="Akira")
        movie = ScreenWork.objects.get(title__iexact="Akira", type='MOVIE')
    except (Work.DoesNotExist, ScreenWork.DoesNotExist):
        try:
            book = Work.objects.filter(title__icontains="Akira").first()
            movie = ScreenWork.objects.filter(title__icontains="Akira", type='MOVIE').first()
        except Exception as e:
            print(f"  ✗ Could not find Akira: {e}")
            return 0

    if not book or not movie:
        print("  ✗ Akira not found in database")
        return 0

    print(f"  ✓ Found: {book.title} → {movie.title}")

    diffs_data = [
        {
            'category': 'PLOT',
            'claim': 'The film only covers about half of the manga\'s story',
            'detail': 'The Akira manga is a sprawling epic spanning six volumes. The film adapts roughly the first half of the story and creates a new ending, omitting major plot developments including the empire-building phase and later character arcs.',
            'spoiler_scope': 'NONE',
            'votes': (95, 5, 0),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Lady Miyako is completely absent from the film',
            'detail': 'Lady Miyako, a powerful psychic who becomes a major player in the manga\'s later chapters, does not appear in the movie at all. This removes an entire faction and storyline from the adaptation.',
            'spoiler_scope': 'BOOK_ONLY',
            'votes': (90, 8, 2),
        },
        {
            'category': 'ENDING',
            'claim': 'The movie creates an entirely original ending',
            'detail': 'While the manga continues past the initial Akira awakening to explore rebuilding Neo-Tokyo and Tetsuo\'s further transformation, the film concludes shortly after Tetsuo\'s confrontation with Akira, with a metaphysical resolution unique to the adaptation.',
            'spoiler_scope': 'FULL',
            'votes': (85, 12, 3),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Kei has a significantly reduced role',
            'detail': 'In the manga, Kei develops psychic powers and becomes crucial to the resolution. The movie maintains her as a member of the resistance but greatly reduces her importance and cuts her psychic development entirely.',
            'spoiler_scope': 'SCREEN_ONLY',
            'votes': (80, 15, 5),
        },
        {
            'category': 'WORLDBUILDING',
            'claim': 'The post-apocalyptic rebuilding phase is omitted',
            'detail': 'A significant portion of the manga deals with different factions rebuilding after Akira\'s awakening, including the Great Tokyo Empire. The film ends before this phase, missing entire sociopolitical storylines.',
            'spoiler_scope': 'BOOK_ONLY',
            'votes': (90, 8, 2),
        },
        {
            'category': 'TONE',
            'claim': 'The film is more visually surreal and psychedelic',
            'detail': 'While both versions feature stunning visuals, the anime film emphasizes psychedelic, abstract imagery particularly in the finale. The manga, while stylized, maintains more grounded visual storytelling throughout.',
            'spoiler_scope': 'NONE',
            'votes': (70, 25, 5),
        },
        {
            'category': 'PLOT',
            'claim': 'The film simplifies the resistance movement subplot',
            'detail': 'The manga extensively develops the anti-government resistance with multiple factions and complex politics. The movie streamlines this to a single resistance group with minimal internal complexity.',
            'spoiler_scope': 'NONE',
            'votes': (85, 10, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Colonel Shikishima has a different character arc',
            'detail': 'The Colonel\'s journey and ultimate fate differ significantly between versions. The manga gives him a more complex evolution and different resolution to his story.',
            'spoiler_scope': 'FULL',
            'votes': (80, 15, 5),
        },
        {
            'category': 'TIMELINE',
            'claim': 'The movie was created before the manga was finished',
            'detail': 'Interestingly, the Akira film was released in 1988 while the manga was still being serialized (1982-1990). Director Katsuhiro Otomo was creating the ending for the film while still writing the manga, leading to divergent conclusions.',
            'spoiler_scope': 'NONE',
            'votes': (95, 3, 2),
        },
        {
            'category': 'THEME',
            'claim': 'The manga explores power and corruption more deeply',
            'detail': 'The extended manga storyline allows for deeper exploration of how power corrupts through Tetsuo\'s empire-building phase and the various factions vying for control. The film focuses more on the immediate chaos and transformation.',
            'spoiler_scope': 'BOOK_ONLY',
            'votes': (75, 20, 5),
        },
    ]

    created_count = 0
    for diff_data in diffs_data:
        votes = diff_data.pop('votes')
        diff, created = DiffItem.objects.get_or_create(
            work=book,
            screen_work=movie,
            claim=diff_data['claim'],
            defaults={
                **diff_data,
                'created_by': admin_user,
                'status': 'LIVE',
            }
        )
        if created:
            add_votes_to_diff(diff, users, *votes)
            created_count += 1
            print(f"  ✓ Created diff: {diff.claim[:60]}...")

    return created_count


def create_over_the_hedge_diffs(admin_user, users):
    """Create diffs for Over the Hedge comic → movie comparison."""

    print("\n" + "="*70)
    print("OVER THE HEDGE (Comic Strip → Movie)")
    print("="*70)

    try:
        book = Work.objects.get(title__iexact="Over the Hedge")
        movie = ScreenWork.objects.get(title__iexact="Over the Hedge", type='MOVIE')
    except (Work.DoesNotExist, ScreenWork.DoesNotExist):
        try:
            book = Work.objects.filter(title__icontains="Over the Hedge").first()
            movie = ScreenWork.objects.filter(title__icontains="Over the Hedge", type='MOVIE').first()
        except Exception as e:
            print(f"  ✗ Could not find Over the Hedge: {e}")
            return 0

    if not book or not movie:
        print("  ✗ Over the Hedge not found in database")
        return 0

    print(f"  ✓ Found: {book.title} → {movie.title}")

    diffs_data = [
        {
            'category': 'PLOT',
            'claim': 'The movie adds an entirely original main plot',
            'detail': 'The comic strip focuses on daily observations about suburban life without an overarching narrative. The film creates a complete story arc involving RJ\'s debt to a bear and the need to steal food from humans.',
            'spoiler_scope': 'NONE',
            'votes': (90, 8, 2),
        },
        {
            'category': 'CHARACTER',
            'claim': 'RJ is more morally ambiguous in the movie',
            'detail': 'In the comic, RJ is simply a witty observer of suburban absurdities. The film makes him a con artist with selfish motivations who undergoes a redemption arc, adding dramatic depth absent from the source material.',
            'spoiler_scope': 'NONE',
            'votes': (85, 12, 3),
        },
        {
            'category': 'TONE',
            'claim': 'The film is more family-friendly and optimistic',
            'detail': 'The comic strip often features darker satire, cynical humor, and occasionally melancholic observations about modern life. The movie is a lighthearted family adventure with more upbeat messaging.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Verne is more neurotic in the film',
            'detail': 'While the comic shows Verne as cautious and thoughtful, the movie amplifies his anxiety and worry into a more pronounced character trait, using it for both humor and character development.',
            'spoiler_scope': 'NONE',
            'votes': (75, 20, 5),
        },
        {
            'category': 'PLOT',
            'claim': 'The Verminator and Gladys are movie-original antagonists',
            'detail': 'The film introduces human antagonists including the HOA president Gladys and the exterminator Dwayne. The comic strip rarely features recurring human antagonists or such conflict-driven plots.',
            'spoiler_scope': 'NONE',
            'votes': (90, 8, 2),
        },
        {
            'category': 'THEME',
            'claim': 'The movie emphasizes friendship and family themes',
            'detail': 'The comic strip is more focused on satirizing consumerism and suburban culture. While the movie maintains some satire, it primarily tells a story about found family, loyalty, and belonging.',
            'spoiler_scope': 'NONE',
            'votes': (85, 10, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Hammy has an expanded comedic role',
            'detail': 'Hammy the squirrel appears in the comic but the movie significantly expands his role, making him a major source of slapstick comedy and giving him the film\'s most memorable sequences.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'SETTING',
            'claim': 'The hedge itself is more central to the movie',
            'detail': 'In the comic, "the hedge" is simply the suburban setting. The film makes the mysterious hedge a specific plot device and symbol, with its appearance marking a turning point for the characters.',
            'spoiler_scope': 'NONE',
            'votes': (85, 12, 3),
        },
        {
            'category': 'PLOT',
            'claim': 'The movie has a structured three-act narrative',
            'detail': 'As a daily comic strip, the source material consists of standalone gags and short story arcs. The film transforms this into a conventional hero\'s journey structure with setup, conflict, and resolution.',
            'spoiler_scope': 'NONE',
            'votes': (95, 5, 0),
        },
        {
            'category': 'OTHER',
            'claim': 'The movie adds extensive celebrity voice casting',
            'detail': 'The comic strip, being a silent medium, has no voice acting. The film features prominent voices including Bruce Willis, Garry Shandling, Steve Carell, and Wanda Sykes, which shapes the characters\' personalities.',
            'spoiler_scope': 'NONE',
            'votes': (70, 20, 10),
        },
    ]

    created_count = 0
    for diff_data in diffs_data:
        votes = diff_data.pop('votes')
        diff, created = DiffItem.objects.get_or_create(
            work=book,
            screen_work=movie,
            claim=diff_data['claim'],
            defaults={
                **diff_data,
                'created_by': admin_user,
                'status': 'LIVE',
            }
        )
        if created:
            add_votes_to_diff(diff, users, *votes)
            created_count += 1
            print(f"  ✓ Created diff: {diff.claim[:60]}...")

    return created_count


def create_cardcaptor_sakura_diffs(admin_user, users):
    """Create diffs for Cardcaptor Sakura manga → anime comparison."""

    print("\n" + "="*70)
    print("CARDCAPTOR SAKURA (Manga → Anime)")
    print("="*70)

    try:
        book = Work.objects.get(title__iexact="Cardcaptor Sakura")
        anime = ScreenWork.objects.filter(title__icontains="Cardcaptor Sakura", type='TV').first()
        if not anime:
            # Try movie as fallback
            anime = ScreenWork.objects.filter(title__icontains="Cardcaptor Sakura", type='MOVIE').first()
    except (Work.DoesNotExist, ScreenWork.DoesNotExist):
        try:
            book = Work.objects.filter(title__icontains="Cardcaptor Sakura").first()
            anime = ScreenWork.objects.filter(title__icontains="Cardcaptor Sakura").first()
        except Exception as e:
            print(f"  ✗ Could not find Cardcaptor Sakura: {e}")
            return 0

    if not book or not anime:
        print("  ✗ Cardcaptor Sakura not found in database")
        return 0

    print(f"  ✓ Found: {book.title} → {anime.title}")

    diffs_data = [
        {
            'category': 'PLOT',
            'claim': 'The anime adds many filler episodes',
            'detail': 'The manga is a relatively concise 12 volumes. The 70-episode anime expands the story significantly with anime-original episodes featuring new Clow Cards and adventures not present in the source material.',
            'spoiler_scope': 'NONE',
            'votes': (90, 8, 2),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Meiling is an anime-original character',
            'detail': 'Li Meiling, Syaoran\'s cousin and self-proclaimed fiancée who appears throughout the first season, was created specifically for the anime and does not exist in the manga at all.',
            'spoiler_scope': 'SCREEN_ONLY',
            'votes': (95, 5, 0),
        },
        {
            'category': 'TONE',
            'claim': 'The anime is more comedic and lighthearted',
            'detail': 'While both versions are appropriate for children, the manga has a more serious tone and faster pacing. The anime adds more comedy, slapstick moments, and lighthearted character interactions.',
            'spoiler_scope': 'NONE',
            'votes': (75, 20, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Syaoran\'s character development is more gradual in the anime',
            'detail': 'The manga shows Syaoran\'s transition from rival to friend relatively quickly. The anime extends this development over many episodes, giving more screentime to his growing friendship with Sakura.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'PLOT',
            'claim': 'The card capture sequence is more formulaic in the anime',
            'detail': 'Many anime episodes follow a predictable structure: daily life, card appears, Sakura captures it. The manga varies its storytelling approach more and sometimes captures multiple cards quickly.',
            'spoiler_scope': 'NONE',
            'votes': (85, 10, 5),
        },
        {
            'category': 'THEME',
            'claim': 'The anime tones down romantic elements',
            'detail': 'The manga includes more mature romantic subplots, including teacher-student relationships. The anime adjusts or de-emphasizes some of these elements for a younger audience.',
            'spoiler_scope': 'NONE',
            'votes': (70, 25, 5),
        },
        {
            'category': 'ENDING',
            'claim': 'The anime ending is more conclusive',
            'detail': 'The manga has a more open-ended conclusion that sets up the sequel series. The anime creates a more definitive ending to its first arc before the second series begins.',
            'spoiler_scope': 'FULL',
            'votes': (75, 20, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Kero-chan has more comedic screentime',
            'detail': 'Kerberos appears regularly in both versions, but the anime significantly expands his role as comic relief, giving him more personality quirks, hobbies, and humorous situations.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'SETTING',
            'claim': 'The anime shows more daily school life',
            'detail': 'The manga focuses more tightly on the card-capturing plot. The anime adds extensive scenes of Sakura at school, field trips, and everyday activities to fill the episode count.',
            'spoiler_scope': 'NONE',
            'votes': (85, 12, 3),
        },
        {
            'category': 'PLOT',
            'claim': 'Some cards have different capture methods',
            'detail': 'While most Clow Cards are captured similarly in both versions, the anime occasionally changes how specific cards are encountered and captured, creating unique scenarios for episodic television.',
            'spoiler_scope': 'NONE',
            'votes': (80, 15, 5),
        },
        {
            'category': 'CHARACTER',
            'claim': 'Tomoyo\'s obsession is more pronounced in the anime',
            'detail': 'Tomoyo\'s dedication to filming Sakura and making costumes is present in both versions, but the anime amplifies this character trait, making it a running gag throughout the series.',
            'spoiler_scope': 'NONE',
            'votes': (75, 20, 5),
        },
    ]

    created_count = 0
    for diff_data in diffs_data:
        votes = diff_data.pop('votes')
        diff, created = DiffItem.objects.get_or_create(
            work=book,
            screen_work=anime,
            claim=diff_data['claim'],
            defaults={
                **diff_data,
                'created_by': admin_user,
                'status': 'LIVE',
            }
        )
        if created:
            add_votes_to_diff(diff, users, *votes)
            created_count += 1
            print(f"  ✓ Created diff: {diff.claim[:60]}...")

    return created_count


def main():
    """Main function to create all sample comparisons."""

    print("="*70)
    print("CREATING SAMPLE BOOK/SCREEN COMPARISONS WITH DIFFS")
    print("="*70)

    # Get or create test users
    print("\nCreating/verifying test users...")
    users = get_or_create_test_users()
    admin_user = users[0]  # First user is admin

    # Create diffs for each comparison
    total_diffs = 0

    total_diffs += create_death_note_diffs(admin_user, users)
    total_diffs += create_akira_diffs(admin_user, users)
    total_diffs += create_over_the_hedge_diffs(admin_user, users)
    total_diffs += create_cardcaptor_sakura_diffs(admin_user, users)

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    all_diffs = DiffItem.objects.all()
    all_votes = DiffVote.objects.all()

    print(f"\nTotal diffs in database: {all_diffs.count()}")
    print(f"Total votes in database: {all_votes.count()}")
    print(f"Diffs created in this run: {total_diffs}")

    # Show breakdown by comparison
    print("\nDiffs per comparison:")
    comparisons = {}
    for diff in all_diffs:
        key = f"{diff.work.title} → {diff.screen_work.title}"
        comparisons[key] = comparisons.get(key, 0) + 1

    for comparison, count in sorted(comparisons.items()):
        print(f"  - {comparison}: {count} diffs")

    print("\n" + "="*70)
    print("DONE!")
    print("="*70)
    print("\nYou can now view these comparisons in the web interface.")
    print("Test users created: admin, movie_buff, book_lover, anime_fan, critic_jane, reader_bob")
    print("All test user passwords: testpass123")


if __name__ == '__main__':
    main()
