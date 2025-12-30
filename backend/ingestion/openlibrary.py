"""Open Library ingestion tasks."""
from typing import Optional, Dict, Any
import re
import requests
from celery import shared_task
from django.conf import settings
from works.models import Work


# Standard literary genres (whitelist)
STANDARD_GENRES = {
    'Fiction': ['fiction', 'novels', 'literature'],
    'Science Fiction': ['science fiction', 'sci-fi', 'scifi', 'science-fiction'],
    'Fantasy': ['fantasy', 'magic', 'sword and sorcery'],
    'Mystery': ['mystery', 'detective', 'crime fiction', 'whodunit', 'thriller'],
    'Thriller': ['thriller', 'suspense', 'psychological thriller'],
    'Horror': ['horror', 'ghost stories', 'supernatural'],
    'Romance': ['romance', 'love stories', 'romantic fiction'],
    'Historical Fiction': ['historical fiction', 'historical novel'],
    'Adventure': ['adventure', 'action and adventure'],
    'Young Adult': ['young adult', 'ya', 'teen', 'juvenile fiction'],
    'Children\'s Literature': ['children\'s fiction', 'juvenile literature', 'children\'s literature', 'children\'s books'],
    'Drama': ['drama', 'plays', 'theatrical productions'],
    'Comedy': ['comedy', 'humor', 'humorous stories'],
    'Dystopian': ['dystopian', 'dystopia', 'post-apocalyptic'],
    'Biography': ['biography', 'autobiography', 'memoir'],
    'Non-Fiction': ['non-fiction', 'nonfiction'],
    'Graphic Novel': ['graphic novels', 'comic books', 'comics', 'manga'],
    'Poetry': ['poetry', 'poems', 'verse'],
    'Short Stories': ['short stories', 'short fiction'],
    'Classic Literature': ['classic', 'classics', 'literary fiction'],
}

# Subjects to ignore (not genres)
IGNORE_SUBJECTS = {
    'accessible book', 'protected daisy', 'in library', 'lending library',
    'open library staff picks', 'new york times bestseller', 'award',
    'series:', 'fiction, general', 'fiction, ', 'reading level-grade',
    'internet archive wishlist', 'browsing:', 'subject:',
}


def extract_primary_genre(subjects: list) -> str:
    """
    Extract the most appropriate genre from Open Library subjects.

    Algorithm:
    1. Filter out non-genre subjects (metadata, series tags, etc.)
    2. Map subjects to standard genres using keywords
    3. Return the first matching standard genre
    4. If no match, return cleaned first subject

    Args:
        subjects: List of subject strings from Open Library

    Returns:
        Standardized genre string (max 100 chars)
    """
    if not subjects:
        return ''

    # Normalize and filter subjects
    cleaned_subjects = []
    for subject in subjects:
        if not isinstance(subject, str):
            continue

        subject_lower = subject.lower().strip()

        # Skip metadata/non-genre subjects
        if any(ignore in subject_lower for ignore in IGNORE_SUBJECTS):
            continue

        # Skip very specific topics (likely not genres)
        # Heuristic: if it's a single word and not capitalized, might be too specific
        words = subject.split()
        if len(words) == 1 and subject_lower == subject and len(subject) > 15:
            continue

        cleaned_subjects.append(subject_lower)

    if not cleaned_subjects:
        return ''

    # Try to match against standard genres
    for standard_genre, keywords in STANDARD_GENRES.items():
        for subject in cleaned_subjects:
            for keyword in keywords:
                if keyword in subject:
                    return standard_genre

    # If no match, return the first cleaned subject (capitalized)
    # but limit to reasonable length and capitalize properly
    first_subject = subjects[0][:100] if isinstance(subjects[0], str) else ''

    # Skip if it's clearly not a genre (all lowercase single word)
    if first_subject.islower() and ' ' not in first_subject:
        return ''

    return first_subject


def fetch_title_from_wikidata(qid: str) -> Optional[str]:
    """
    Fetch the English title/label for a Wikidata entity.

    Args:
        qid: Wikidata QID (e.g., "Q10397313")

    Returns:
        English label or None if not found
    """
    try:
        url = f"https://www.wikidata.org/wiki/Special:EntityData/{qid}.json"
        headers = {
            'User-Agent': 'Adaptapedia/1.0 (https://adaptapedia.org; contact@adaptapedia.org) Python/requests'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        data = response.json()
        entity_data = data.get('entities', {}).get(qid, {})
        labels = entity_data.get('labels', {})

        # Try English label first
        if 'en' in labels:
            return labels['en']['value']

        # Fallback to any available label
        if labels:
            return next(iter(labels.values()))['value']

    except Exception as e:
        print(f"Error fetching Wikidata title for {qid}: {e}")

    return None


@shared_task
def enrich_work_from_openlibrary(work_id: int) -> Dict[str, Any]:
    """
    Enrich a Work with metadata from Open Library.

    Args:
        work_id: ID of the Work to enrich.

    Returns:
        dict: Statistics about the enrichment.
    """
    try:
        work = Work.objects.get(id=work_id)

        # Check if title is a Q-number (Wikidata QID)
        search_title = work.title
        if re.match(r'^Q\d+$', work.title) and work.wikidata_qid:
            # Fetch real title from Wikidata
            real_title = fetch_title_from_wikidata(work.wikidata_qid)
            if real_title:
                search_title = real_title
                work.title = real_title  # Update the work with real title
                work.save(update_fields=['title'])
            else:
                return {'success': False, 'error': 'Could not fetch title from Wikidata'}

        if not work.openlibrary_work_id:
            # Search for the work
            search_url = f"{settings.OPEN_LIBRARY_BASE_URL}/search.json"
            params = {'title': search_title, 'limit': 1}
            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            if data.get('docs'):
                doc = data['docs'][0]
                if 'key' in doc:
                    work.openlibrary_work_id = doc['key']

        # Fetch detailed work data
        if work.openlibrary_work_id:
            work_url = f"{settings.OPEN_LIBRARY_BASE_URL}{work.openlibrary_work_id}.json"
            response = requests.get(work_url, timeout=10)
            response.raise_for_status()

            ol_data = response.json()

            # Update work with Open Library data
            if 'description' in ol_data and not work.summary:
                desc = ol_data['description']
                work.summary = desc['value'] if isinstance(desc, dict) else desc

            if 'first_publish_year' in ol_data and not work.year:
                work.year = ol_data['first_publish_year']

            if 'covers' in ol_data and ol_data['covers'] and not work.cover_url:
                cover_id = ol_data['covers'][0]
                work.cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"

            # Extract author information
            if 'authors' in ol_data and ol_data['authors'] and not work.author:
                author_keys = [a['author']['key'] if isinstance(a, dict) and 'author' in a else a.get('key') for a in ol_data['authors']]
                if author_keys and author_keys[0]:
                    # Fetch author details
                    author_url = f"{settings.OPEN_LIBRARY_BASE_URL}{author_keys[0]}.json"
                    try:
                        author_response = requests.get(author_url, timeout=10)
                        author_response.raise_for_status()
                        author_data = author_response.json()
                        if 'name' in author_data:
                            work.author = author_data['name']
                    except Exception:
                        pass

            # Extract genre from subjects using intelligent mapping
            if 'subjects' in ol_data and ol_data['subjects'] and not work.genre:
                work.genre = extract_primary_genre(ol_data['subjects'])

            # Fetch ratings from Open Library
            ratings_url = f"{settings.OPEN_LIBRARY_BASE_URL}{work.openlibrary_work_id}/ratings.json"
            try:
                ratings_response = requests.get(ratings_url, timeout=10)
                ratings_response.raise_for_status()
                ratings_data = ratings_response.json()

                if 'summary' in ratings_data:
                    ol_average = ratings_data['summary'].get('average')
                    ol_count = ratings_data['summary'].get('count')

                    # Use Open Library ratings if they have more votes than existing (Google Books)
                    # or if no ratings exist yet
                    if ol_average and ol_count:
                        should_use_ol = False

                        if not work.average_rating or not work.ratings_count:
                            # No existing ratings, use OL
                            should_use_ol = True
                        elif ol_count > work.ratings_count:
                            # OL has more ratings, use it
                            should_use_ol = True

                        if should_use_ol:
                            work.average_rating = ol_average
                            work.ratings_count = ol_count
            except Exception as e:
                print(f"Failed to fetch Open Library ratings: {e}")

            work.save()

            return {'success': True, 'work_id': work_id}

    except Work.DoesNotExist:
        return {'success': False, 'error': 'Work not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

    return {'success': False, 'error': 'No Open Library ID found'}
