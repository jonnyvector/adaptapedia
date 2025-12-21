# Sample Comparisons Script

## Overview

The `create_sample_comparisons.py` script creates high-quality sample book-to-screen comparisons with detailed diffs for demonstration and testing purposes.

## What It Creates

### 4 Complete Comparisons

1. **Death Note** (Manga → Movie) - 10 diffs
2. **Akira** (Manga → Movie) - 10 diffs
3. **Over the Hedge** (Comic Strip → Movie) - 10 diffs
4. **Cardcaptor Sakura** (Manga → Anime) - 11 diffs

**Total: 41 new diffs** with realistic community votes

### Test Users

The script creates 6 test users for voting:

- `admin` (ADMIN role)
- `movie_buff` (USER)
- `book_lover` (USER)
- `anime_fan` (USER)
- `critic_jane` (USER)
- `reader_bob` (USER)

All passwords: `testpass123`

## Features

### Comprehensive Category Coverage

- **PLOT** (15 diffs) - Story changes and narrative differences
- **CHARACTER** (16 diffs) - Character development and portrayal
- **ENDING** (5 diffs) - How the stories conclude
- **SETTING** (3 diffs) - Location and world differences
- **THEME** (5 diffs) - Thematic exploration changes
- **TONE** (5 diffs) - Tonal shifts between versions
- **TIMELINE** (1 diff) - Production timeline facts
- **WORLDBUILDING** (1 diff) - World construction differences
- **OTHER** (1 diff) - Miscellaneous differences

### Spoiler Scope Distribution

- **NONE** (36 diffs) - Safe for all readers
- **BOOK_ONLY** (8 diffs) - Spoils only the book
- **SCREEN_ONLY** (2 diffs) - Spoils only the screen adaptation
- **FULL** (6 diffs) - Spoils both versions

### Realistic Voting

Each diff receives 2-5 votes from test users with weighted distribution:
- **ACCURATE** (~70-95%) - 136 total votes
- **NEEDS_NUANCE** (~5-25%) - 24 total votes
- **DISAGREE** (~0-10%) - 5 total votes

## Usage

### Run the Script

```bash
docker-compose exec backend python scripts/create_sample_comparisons.py
```

### Verify Results

Check what was created:

```bash
docker-compose exec backend python manage.py shell
```

Then in the shell:

```python
from diffs.models import DiffItem, DiffVote

# See all comparisons
for diff in DiffItem.objects.all():
    print(f"{diff.work.title} → {diff.screen_work.title}: {diff.claim}")

# Check total counts
print(f"Total diffs: {DiffItem.objects.count()}")
print(f"Total votes: {DiffVote.objects.count()}")
```

### View in Web Interface

After running the script, navigate to the comparisons in your web browser to see the diffs displayed with their votes and details.

## Script Design

### Quality Standards

Each diff includes:

1. **Claim** (10-200 chars) - Concise, factual statement of the difference
2. **Detail** (optional, max 1000 chars) - Longer explanation with context
3. **Accurate categorization** - Proper use of PLOT, CHARACTER, ENDING, etc.
4. **Appropriate spoiler scope** - Carefully chosen to protect readers
5. **Realistic votes** - Weighted distribution simulating community consensus

### Example Diff

```python
{
    'category': 'CHARACTER',
    'claim': 'Meiling is an anime-original character',
    'detail': 'Li Meiling, Syaoran\'s cousin and self-proclaimed fiancée who appears throughout the first season, was created specifically for the anime and does not exist in the manga at all.',
    'spoiler_scope': 'SCREEN_ONLY',
    'votes': (95, 5, 0),  # 95% accurate, 5% nuance, 0% disagree
}
```

## Re-running the Script

The script uses `get_or_create()` so:

- **First run**: Creates all diffs and users
- **Subsequent runs**: Skips existing diffs (idempotent)
- Safe to run multiple times without duplicates

## Dependencies

Requires:
- Django models: Work, ScreenWork, DiffItem, DiffVote, User
- Database with the 4 adaptations already ingested from Wikidata
- Docker Compose environment running

## Notes

- The script automatically finds the correct book and screen work pairs from the database
- If an adaptation is not found, it prints an error and skips that comparison
- Votes are randomly distributed among test users with realistic weighting
- All diffs are created with `status='LIVE'` so they appear immediately

## Troubleshooting

### "Not found in database" errors

If an adaptation isn't found, check that it was properly ingested:

```bash
docker-compose exec backend python manage.py shell -c "from works.models import Work; from screen.models import ScreenWork; print(Work.objects.filter(title__icontains='Death Note').count()); print(ScreenWork.objects.filter(title__icontains='Death Note').count())"
```

### No votes appearing

Ensure test users were created:

```bash
docker-compose exec backend python manage.py shell -c "from users.models import User; print(User.objects.filter(username__in=['admin', 'movie_buff', 'book_lover']).count())"
```

## Future Enhancements

Potential improvements:

- Add more comparisons (Lord of the Rings, Harry Potter, etc.)
- Create sample comments on diffs
- Add sample moderation queue items
- Generate sample user profiles with avatars
- Create sample watchlists/favorites
