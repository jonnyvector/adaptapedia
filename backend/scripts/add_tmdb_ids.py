#!/usr/bin/env python
"""
Search for and add TMDb IDs to popular screen works.

This script helps find correct TMDb IDs by searching the TMDb API
and updating screen works in the database.

Usage:
    docker-compose exec backend python scripts/add_tmdb_ids.py
"""

import os
import sys
import django
import requests
import time

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from screen.models import ScreenWork

# TMDb API Configuration
TMDB_API_KEY = 'fc9c9bf0b54eb3f152d8fb90b8527fe6'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'


def search_tmdb(title: str, year: int = None, media_type: str = 'movie'):
    """Search TMDb for a title."""
    endpoint = f'{TMDB_BASE_URL}/search/{media_type}'
    params = {
        'api_key': TMDB_API_KEY,
        'query': title
    }
    if year:
        if media_type == 'movie':
            params['year'] = year
        else:
            params['first_air_date_year'] = year

    try:
        response = requests.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('results', [])
    except requests.exceptions.RequestException as e:
        print(f"Error searching TMDb: {e}")
        return []


def main():
    """Main function to add TMDb IDs."""
    print("=" * 80)
    print("ADDING TMDb IDs TO POPULAR TITLES")
    print("=" * 80)

    # Popular titles to add TMDb IDs for
    # Format: (title_search, expected_year, media_type, correct_tmdb_id)
    popular_titles = [
        # Movies we need to fix
        ('Sphere', 1998, 'movie', 9803),  # Correct TMDb ID for Sphere (1998)

        # Anime/Manga adaptations
        ('Akira', 1988, 'movie', 149),  # Akira (1988)
        ('Death Note', 2006, 'movie', 1359),  # Death Note (2006 Japanese film)
        ('Cardcaptor Sakura Movie', 1999, 'movie', 38678),  # Cardcaptor Sakura Movie

        # Popular Western adaptations
        ('The Lord of the Rings: The Fellowship of the Ring', 2001, 'movie', 120),
        ('The Lord of the Rings: The Two Towers', 2002, 'movie', 121),
        ('The Lord of the Rings: The Return of the King', 2003, 'movie', 122),
        ('Harry Potter and the Philosopher\'s Stone', 2001, 'movie', 671),
        ('Harry Potter and the Chamber of Secrets', 2002, 'movie', 672),
        ('Harry Potter and the Prisoner of Azkaban', 2004, 'movie', 673),
        ('The Hunger Games', 2012, 'movie', 70160),
        ('Dune', 2021, 'movie', 438631),
        ('The Shining', 1980, 'movie', 694),
        ('Blade Runner', 1982, 'movie', 78),
        ('Gone Girl', 2014, 'movie', 210577),
        ('The Martian', 2015, 'movie', 286217),
        ('The Princess Bride', 1987, 'movie', 2493),
        ('The Wizard of Oz', 1939, 'movie', 630),
        ('Fight Club', 1999, 'movie', 550),
        ('The Godfather', 1972, 'movie', 238),
    ]

    added_count = 0
    updated_count = 0
    not_found_count = 0

    for title_search, year, media_type, tmdb_id in popular_titles:
        print(f"\n🔍 Searching for: {title_search} ({year})")

        # Search for the screen work in our database
        screen_works = ScreenWork.objects.filter(title__icontains=title_search)

        if not screen_works.exists():
            print(f"  ⚠️  Not found in database: {title_search}")
            not_found_count += 1
            time.sleep(0.3)
            continue

        # Take the first match (or the one with matching year)
        screen_work = None
        for sw in screen_works:
            if sw.year == year or str(year) in (sw.title or ''):
                screen_work = sw
                break

        if not screen_work:
            screen_work = screen_works.first()

        print(f"  📺 Found in DB: {screen_work.title} (ID: {screen_work.id})")

        # Check if it already has the correct TMDb ID
        if screen_work.tmdb_id == tmdb_id:
            print(f"  ✓ Already has correct TMDb ID: {tmdb_id}")
            time.sleep(0.3)
            continue

        # Verify the TMDb ID is correct by fetching details
        endpoint_type = 'movie' if media_type == 'movie' else 'tv'
        endpoint = f'{TMDB_BASE_URL}/{endpoint_type}/{tmdb_id}'
        params = {'api_key': TMDB_API_KEY}

        try:
            response = requests.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            tmdb_title = data.get('title') if media_type == 'movie' else data.get('name')
            tmdb_year_field = 'release_date' if media_type == 'movie' else 'first_air_date'
            tmdb_year = data.get(tmdb_year_field, '')[:4]

            print(f"  ℹ️  TMDb says: '{tmdb_title}' ({tmdb_year})")

            # Update the screen work
            old_tmdb_id = screen_work.tmdb_id
            screen_work.tmdb_id = tmdb_id

            # Also update year if we have it
            if tmdb_year and not screen_work.year:
                screen_work.year = int(tmdb_year)

            screen_work.save()

            if old_tmdb_id:
                print(f"  ✅ Updated TMDb ID: {old_tmdb_id} → {tmdb_id}")
                updated_count += 1
            else:
                print(f"  ✅ Added TMDb ID: {tmdb_id}")
                added_count += 1

        except requests.exceptions.RequestException as e:
            print(f"  ❌ Error verifying TMDb ID: {e}")

        time.sleep(0.3)  # Rate limiting

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ TMDb IDs added: {added_count}")
    print(f"🔄 TMDb IDs updated: {updated_count}")
    print(f"⚠️  Not found in database: {not_found_count}")
    print(f"📊 Total processed: {added_count + updated_count + not_found_count}")

    # Show screen works with TMDb IDs
    with_tmdb = ScreenWork.objects.filter(tmdb_id__isnull=False).exclude(tmdb_id=0)
    print(f"\n📊 Total screen works with TMDb IDs: {with_tmdb.count()}")


if __name__ == '__main__':
    main()
