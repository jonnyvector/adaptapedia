#!/usr/bin/env python
"""
Enrich screen works with TMDb metadata (posters, summaries, release dates).

This script fetches metadata from The Movie Database (TMDb) API for screen works
that have a tmdb_id and enriches them with poster URLs, enhanced summaries, and
accurate release years.

Usage:
    docker-compose exec backend python scripts/enrich_tmdb_metadata.py

    Or with specific titles:
    docker-compose exec backend python scripts/enrich_tmdb_metadata.py --titles "Jurassic Park" "Sphere"
"""

import os
import sys
import django
import requests
import time
import argparse
from typing import Optional, Dict, Any

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings')
django.setup()

from screen.models import ScreenWork

# TMDb API Configuration
TMDB_API_KEY = 'fc9c9bf0b54eb3f152d8fb90b8527fe6'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

# Rate limiting configuration (TMDb allows 40 requests per 10 seconds)
RATE_LIMIT_DELAY = 0.3  # seconds between requests (~3 requests per second)


def fetch_tmdb_data(tmdb_id: int, media_type: str) -> Optional[Dict[str, Any]]:
    """
    Fetch metadata from TMDb API.

    Args:
        tmdb_id: The TMDb ID of the screen work
        media_type: Either 'MOVIE' or 'TV'

    Returns:
        Dictionary containing TMDb metadata or None if request fails
    """
    endpoint_type = 'movie' if media_type == 'MOVIE' else 'tv'
    endpoint = f'{TMDB_BASE_URL}/{endpoint_type}/{tmdb_id}'
    params = {'api_key': TMDB_API_KEY}

    try:
        response = requests.get(endpoint, params=params, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            print(f"  ⚠️  TMDb ID {tmdb_id} not found (404)")
        elif response.status_code == 429:
            print(f"  ⚠️  Rate limit exceeded, waiting 10 seconds...")
            time.sleep(10)
            return fetch_tmdb_data(tmdb_id, media_type)  # Retry
        else:
            print(f"  ❌ HTTP error fetching TMDb data: {e}")
        return None
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error fetching TMDb data: {e}")
        return None


def enrich_screen_work(screen_work: ScreenWork, force: bool = False) -> bool:
    """
    Enrich a single screen work with TMDb data.

    Args:
        screen_work: ScreenWork instance to enrich
        force: If True, update even if data already exists

    Returns:
        True if successfully enriched, False otherwise
    """
    if not screen_work.tmdb_id:
        print(f"⏭️  Skipping '{screen_work.title}': No TMDb ID")
        return False

    # Skip if already has good data (unless force is True)
    if not force and screen_work.poster_url and len(screen_work.summary or '') > 100:
        print(f"⏭️  Skipping '{screen_work.title}': Already has good data (use --force to override)")
        return False

    print(f"\n🎬 Enriching: {screen_work.title} (TMDb ID: {screen_work.tmdb_id}, Type: {screen_work.type})")

    data = fetch_tmdb_data(screen_work.tmdb_id, screen_work.type)
    if not data:
        return False

    updated_fields = []

    # Update poster URL
    if data.get('poster_path'):
        old_poster = screen_work.poster_url
        screen_work.poster_url = IMAGE_BASE_URL + data['poster_path']
        if old_poster != screen_work.poster_url:
            updated_fields.append('poster_url')
            print(f"  ✓ Poster URL: {screen_work.poster_url}")
    else:
        print(f"  ⚠️  No poster available from TMDb")

    # Update summary if current one is short/missing or force is True
    if data.get('overview'):
        current_summary_len = len(screen_work.summary or '')
        new_summary_len = len(data['overview'])

        if force or current_summary_len < 100:
            old_summary = screen_work.summary
            screen_work.summary = data['overview']
            if old_summary != screen_work.summary:
                updated_fields.append('summary')
                print(f"  ✓ Summary: {new_summary_len} characters (was: {current_summary_len})")
        else:
            print(f"  ℹ️  Keeping existing summary ({current_summary_len} chars, TMDb has {new_summary_len} chars)")

    # Update year
    if screen_work.type == 'MOVIE' and data.get('release_date'):
        try:
            year = int(data['release_date'][:4])
            if screen_work.year != year:
                old_year = screen_work.year
                screen_work.year = year
                updated_fields.append('year')
                print(f"  ✓ Year: {year} (was: {old_year})")
        except (ValueError, IndexError):
            print(f"  ⚠️  Could not parse release_date: {data['release_date']}")
    elif screen_work.type == 'TV' and data.get('first_air_date'):
        try:
            year = int(data['first_air_date'][:4])
            if screen_work.year != year:
                old_year = screen_work.year
                screen_work.year = year
                updated_fields.append('year')
                print(f"  ✓ Year: {year} (was: {old_year})")
        except (ValueError, IndexError):
            print(f"  ⚠️  Could not parse first_air_date: {data['first_air_date']}")

    # Verify title matches (for quality assurance)
    tmdb_title = data.get('title') if screen_work.type == 'MOVIE' else data.get('name')
    if tmdb_title:
        print(f"  ℹ️  TMDb title: '{tmdb_title}'")

    # Save changes
    if updated_fields:
        screen_work.save()
        print(f"  ✅ Updated {screen_work.title} ({', '.join(updated_fields)})")
        return True
    else:
        print(f"  ℹ️  No changes needed for {screen_work.title}")
        return False


def main():
    """Main function to enrich screen works."""
    parser = argparse.ArgumentParser(description='Enrich screen works with TMDb metadata')
    parser.add_argument(
        '--titles',
        nargs='+',
        help='Specific titles to enrich (partial match, case-insensitive)'
    )
    parser.add_argument(
        '--ids',
        nargs='+',
        type=int,
        help='Specific screen work IDs to enrich'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Enrich all screen works with TMDb IDs'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force update even if data already exists'
    )
    parser.add_argument(
        '--limit',
        type=int,
        default=20,
        help='Maximum number of screen works to enrich (default: 20)'
    )

    args = parser.parse_args()

    print("=" * 80)
    print("TMDb METADATA ENRICHMENT")
    print("=" * 80)

    # Build queryset
    queryset = ScreenWork.objects.filter(tmdb_id__isnull=False).exclude(tmdb_id=0)

    if args.ids:
        queryset = queryset.filter(id__in=args.ids)
        print(f"\n🎯 Filtering by IDs: {args.ids}")
    elif args.titles:
        # Filter by titles (OR condition for multiple titles)
        from django.db.models import Q
        title_query = Q()
        for title in args.titles:
            title_query |= Q(title__icontains=title)
        queryset = queryset.filter(title_query)
        print(f"\n🎯 Filtering by titles: {args.titles}")
    elif not args.all:
        # Default: Show available screen works and prompt
        total_count = queryset.count()
        print(f"\n📊 Found {total_count} screen work(s) with TMDb IDs")

        if total_count == 0:
            print("\n⚠️  No screen works with TMDb IDs found!")
            print("💡 You may need to add TMDb IDs to screen works first.")
            return

        print("\n📋 Available screen works:")
        for sw in queryset[:20]:
            poster_status = '✓' if sw.poster_url else '✗'
            summary_len = len(sw.summary or '')
            print(f"  [{poster_status}] ID {sw.id:4d}: {sw.title[:50]:50s} (TMDb: {sw.tmdb_id}, Summary: {summary_len:3d} chars)")

        if total_count > 20:
            print(f"  ... and {total_count - 20} more")

        print("\n💡 Usage examples:")
        print("  Enrich all:              python scripts/enrich_tmdb_metadata.py --all")
        print("  Enrich specific titles:  python scripts/enrich_tmdb_metadata.py --titles 'Jurassic Park' 'Sphere'")
        print("  Enrich specific IDs:     python scripts/enrich_tmdb_metadata.py --ids 4563 4564")
        print("  Force update:            python scripts/enrich_tmdb_metadata.py --all --force")
        return

    # Apply limit
    total_to_process = queryset.count()
    queryset = queryset[:args.limit] if not args.all else queryset

    print(f"\n📊 Processing {min(total_to_process, args.limit)} of {total_to_process} screen work(s)")
    print(f"⚙️  Force mode: {'ON' if args.force else 'OFF'}")
    print(f"⏱️  Rate limit: {RATE_LIMIT_DELAY}s between requests")

    # Enrich screen works
    enriched_count = 0
    failed_count = 0
    skipped_count = 0

    for screen_work in queryset:
        result = enrich_screen_work(screen_work, force=args.force)

        if result:
            enriched_count += 1
        elif result is False and screen_work.tmdb_id:
            # Only count as failed if it has TMDb ID but enrichment failed
            if not (screen_work.poster_url and len(screen_work.summary or '') > 100):
                failed_count += 1
            else:
                skipped_count += 1

        # Rate limiting
        time.sleep(RATE_LIMIT_DELAY)

    # Summary
    print("\n" + "=" * 80)
    print("ENRICHMENT SUMMARY")
    print("=" * 80)
    print(f"✅ Successfully enriched: {enriched_count}")
    print(f"⏭️  Skipped (already good): {skipped_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📊 Total processed: {enriched_count + skipped_count + failed_count}")

    # Show sample of enriched works
    if enriched_count > 0:
        print("\n🎉 Sample of enriched works:")
        enriched_works = ScreenWork.objects.filter(
            poster_url__isnull=False
        ).exclude(poster_url='')[:5]

        for sw in enriched_works:
            print(f"\n  📽️  {sw.title} ({sw.year or 'N/A'})")
            print(f"      Type: {sw.get_type_display()}")
            print(f"      TMDb ID: {sw.tmdb_id}")
            print(f"      Poster: {sw.poster_url[:60]}...")
            print(f"      Summary: {len(sw.summary or '')} characters")

    print("\n" + "=" * 80)


if __name__ == '__main__':
    main()
