#!/usr/bin/env python
"""
Search TMDb and add IDs for popular screen works.

This script searches TMDb API for titles and lets you select the correct match.

Usage:
    docker-compose exec backend python scripts/search_and_add_tmdb_ids.py
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


def search_tmdb(title: str, media_type: str = 'movie'):
    """Search TMDb for a title."""
    endpoint = f'{TMDB_BASE_URL}/search/{media_type}'
    params = {
        'api_key': TMDB_API_KEY,
        'query': title
    }

    try:
        response = requests.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data.get('results', [])
    except requests.exceptions.RequestException as e:
        print(f"Error searching TMDb: {e}")
        return []


def main():
    """Main function to search and add TMDb IDs."""
    print("=" * 80)
    print("SEARCHING AND ADDING TMDb IDs")
    print("=" * 80)

    # Titles to search for with their expected media type
    # Format: (database_id, search_query, media_type, description)
    titles_to_search = [
        # Core titles we already have
        (4, 'Akira 1988', 'movie', 'Akira (1988 anime film)'),
        (8, 'Death Note 2006', 'movie', 'Death Note (Japanese film)'),
        (30, 'Cardcaptor Sakura Movie', 'movie', 'Cardcaptor Sakura: The Movie'),
        (53, 'Cardcaptor Sakura', 'tv', 'Cardcaptor Sakura TV series'),

        # Popular anime
        (3749, 'Naruto', 'tv', 'Naruto TV series'),
        (3746, 'Naruto Shippuden', 'tv', 'Naruto: Shippūden'),
        (3671, 'Dragon Ball', 'tv', 'Dragon Ball'),
        (3672, 'Dragon Ball Z', 'tv', 'Dragon Ball Z'),
        (2129, 'Sailor Moon', 'tv', 'Sailor Moon'),
        (4522, 'Spy Family', 'tv', 'Spy × Family'),

        # Death Note sequels
        (158, 'Death Note 2 Last Name', 'movie', 'Death Note 2: The Last Name'),

        # Detective Conan
        (2900, 'Detective Conan Scarlet Bullet', 'movie', 'Detective Conan: The Scarlet Bullet'),
    ]

    added_count = 0
    failed_count = 0

    for db_id, search_query, media_type, description in titles_to_search:
        print(f"\n{'='*80}")
        print(f"🔍 Searching for: {description}")
        print(f"   DB ID: {db_id} | Search: '{search_query}' | Type: {media_type}")

        # Get the screen work from database
        try:
            screen_work = ScreenWork.objects.get(id=db_id)
        except ScreenWork.DoesNotExist:
            print(f"  ❌ Screen work ID {db_id} not found in database")
            failed_count += 1
            continue

        print(f"  📺 Current title in DB: {screen_work.title}")
        print(f"     Current TMDb ID: {screen_work.tmdb_id or 'None'}")

        # Search TMDb
        results = search_tmdb(search_query, media_type)
        time.sleep(0.3)  # Rate limiting

        if not results:
            print(f"  ⚠️  No results found on TMDb")
            failed_count += 1
            continue

        # Show top 3 results
        print(f"\n  📊 Top TMDb results:")
        for i, result in enumerate(results[:3], 1):
            tmdb_id = result.get('id')
            title = result.get('title') if media_type == 'movie' else result.get('name')
            year_field = 'release_date' if media_type == 'movie' else 'first_air_date'
            year = result.get(year_field, '')[:4]
            overview = result.get('overview', '')[:100]

            print(f"  [{i}] ID: {tmdb_id:6d} | {title} ({year})")
            print(f"      {overview}...")

        # Take the first result (most relevant)
        best_match = results[0]
        tmdb_id = best_match.get('id')
        title = best_match.get('title') if media_type == 'movie' else best_match.get('name')

        # Check if this TMDb ID is already used by another screen work
        existing = ScreenWork.objects.filter(tmdb_id=tmdb_id).exclude(id=db_id).first()
        if existing:
            print(f"\n  ⚠️  TMDb ID {tmdb_id} already used by: {existing.title} (ID: {existing.id})")
            print(f"     Skipping to avoid duplicate...")
            failed_count += 1
            continue

        # Update the screen work
        old_tmdb_id = screen_work.tmdb_id
        screen_work.tmdb_id = tmdb_id

        # Update type if needed
        if media_type == 'tv' and screen_work.type != 'TV':
            screen_work.type = 'TV'
        elif media_type == 'movie' and screen_work.type != 'MOVIE':
            screen_work.type = 'MOVIE'

        screen_work.save()

        if old_tmdb_id:
            print(f"\n  ✅ Updated TMDb ID: {old_tmdb_id} → {tmdb_id}")
        else:
            print(f"\n  ✅ Added TMDb ID: {tmdb_id}")

        added_count += 1

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"✅ TMDb IDs added/updated: {added_count}")
    print(f"❌ Failed: {failed_count}")

    # Show screen works with TMDb IDs
    with_tmdb = ScreenWork.objects.filter(tmdb_id__isnull=False).exclude(tmdb_id=0)
    print(f"\n📊 Total screen works with TMDb IDs: {with_tmdb.count()}")

    print("\n📋 Screen works ready for enrichment:")
    for sw in with_tmdb[:15]:
        poster_status = '✓' if sw.poster_url else '✗'
        print(f"  [{poster_status}] ID {sw.id:4d}: {sw.title[:50]:50s} (TMDb: {sw.tmdb_id})")


if __name__ == '__main__':
    main()
