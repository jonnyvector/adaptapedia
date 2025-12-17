"""TMDb ingestion tasks."""
from typing import Dict, Any
import requests
from celery import shared_task
from django.conf import settings
from screen.models import ScreenWork


@shared_task
def enrich_screenwork_from_tmdb(screen_work_id: int) -> Dict[str, Any]:
    """
    Enrich a ScreenWork with metadata from TMDb.

    Args:
        screen_work_id: ID of the ScreenWork to enrich.

    Returns:
        dict: Statistics about the enrichment.
    """
    if not settings.TMDB_API_KEY:
        return {'success': False, 'error': 'TMDb API key not configured'}

    try:
        screen_work = ScreenWork.objects.get(id=screen_work_id)

        if not screen_work.tmdb_id:
            # Search for the work
            media_type = 'movie' if screen_work.type == 'MOVIE' else 'tv'
            search_url = f"https://api.themoviedb.org/3/search/{media_type}"
            params = {
                'api_key': settings.TMDB_API_KEY,
                'query': screen_work.title,
            }
            if screen_work.year:
                year_param = 'first_air_date_year' if media_type == 'tv' else 'year'
                params[year_param] = screen_work.year

            response = requests.get(search_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            if data.get('results'):
                screen_work.tmdb_id = data['results'][0]['id']

        # Fetch detailed data
        if screen_work.tmdb_id:
            media_type = 'movie' if screen_work.type == 'MOVIE' else 'tv'
            detail_url = f"https://api.themoviedb.org/3/{media_type}/{screen_work.tmdb_id}"
            params = {'api_key': settings.TMDB_API_KEY}
            response = requests.get(detail_url, params=params, timeout=10)
            response.raise_for_status()

            tmdb_data = response.json()

            # Update screen work with TMDb data
            if 'overview' in tmdb_data and not screen_work.summary:
                screen_work.summary = tmdb_data['overview']

            if 'poster_path' in tmdb_data and tmdb_data['poster_path'] and not screen_work.poster_url:
                screen_work.poster_url = f"https://image.tmdb.org/t/p/w500{tmdb_data['poster_path']}"

            # Set year from release date
            if screen_work.type == 'MOVIE' and 'release_date' in tmdb_data and not screen_work.year:
                release_date = tmdb_data['release_date']
                if release_date:
                    screen_work.year = int(release_date[:4])
            elif screen_work.type == 'TV' and 'first_air_date' in tmdb_data and not screen_work.year:
                first_air = tmdb_data['first_air_date']
                if first_air:
                    screen_work.year = int(first_air[:4])

            screen_work.save()

            return {'success': True, 'screen_work_id': screen_work_id}

    except ScreenWork.DoesNotExist:
        return {'success': False, 'error': 'ScreenWork not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

    return {'success': False, 'error': 'No TMDb ID found'}
