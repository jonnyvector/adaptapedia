"""Open Library ingestion tasks."""
from typing import Optional, Dict, Any
import requests
from celery import shared_task
from django.conf import settings
from works.models import Work


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

        if not work.openlibrary_work_id:
            # Search for the work
            search_url = f"{settings.OPEN_LIBRARY_BASE_URL}/search.json"
            params = {'title': work.title, 'limit': 1}
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

            # Extract genre from subjects (take first subject as primary genre)
            if 'subjects' in ol_data and ol_data['subjects'] and not work.genre:
                work.genre = ol_data['subjects'][0][:100] if isinstance(ol_data['subjects'][0], str) else ''

            work.save()

            return {'success': True, 'work_id': work_id}

    except Work.DoesNotExist:
        return {'success': False, 'error': 'Work not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

    return {'success': False, 'error': 'No Open Library ID found'}
