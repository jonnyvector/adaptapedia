"""TMDb ingestion tasks."""
from typing import Dict, Any, List
import requests
from celery import shared_task
from django.conf import settings
from screen.models import ScreenWork
from screen.utils.color_extraction import extract_dominant_color

# TMDb genre ID to standard genre mapping
TMDB_GENRE_MAPPING = {
    # Movie genres
    28: 'Adventure',        # Action
    12: 'Adventure',        # Adventure
    16: 'Graphic Novel',    # Animation
    35: 'Comedy',           # Comedy
    80: 'Mystery',          # Crime
    99: 'Non-Fiction',      # Documentary
    18: 'Drama',            # Drama
    10751: 'Children\'s Literature',  # Family
    14: 'Fantasy',          # Fantasy
    36: 'Historical Fiction',  # History
    27: 'Horror',           # Horror
    10402: 'Drama',         # Music
    9648: 'Mystery',        # Mystery
    10749: 'Romance',       # Romance
    878: 'Science Fiction', # Science Fiction
    10770: 'Drama',         # TV Movie
    53: 'Thriller',         # Thriller
    10752: 'Historical Fiction',  # War
    37: 'Adventure',        # Western

    # TV genres (overlap with some movie genres)
    10759: 'Adventure',     # Action & Adventure
    10762: 'Children\'s Literature',  # Kids
    10763: 'Non-Fiction',   # News
    10764: 'Non-Fiction',   # Reality
    10765: 'Science Fiction',  # Sci-Fi & Fantasy
    10766: 'Drama',         # Soap
    10767: 'Non-Fiction',   # Talk
    10768: 'Historical Fiction',  # War & Politics
}


def extract_genres_from_tmdb(tmdb_data: dict) -> tuple[str, list[str]]:
    """
    Extract genres from TMDb data.

    Args:
        tmdb_data: TMDb API response with 'genres' array

    Returns:
        Tuple of (primary_genre, all_genres)
        - primary_genre: First genre name from TMDb
        - all_genres: List of all genre names
    """
    genres = tmdb_data.get('genres', [])
    if not genres:
        return '', []

    # Extract all genre names
    genre_names = [genre.get('name', '') for genre in genres if genre.get('name')]

    # Primary genre is the first one
    primary = genre_names[0] if genre_names else ''

    return primary, genre_names


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
                # Use w780 for higher quality (or 'original' for highest, but larger file size)
                screen_work.poster_url = f"https://image.tmdb.org/t/p/w780{tmdb_data['poster_path']}"

                # Extract dominant color from poster for light mode background tints
                if not screen_work.dominant_color:
                    dominant_color = extract_dominant_color(screen_work.poster_url, lighten_percent=0.80)
                    if dominant_color:
                        screen_work.dominant_color = dominant_color

            # Set backdrop for cinematic hero backgrounds
            if 'backdrop_path' in tmdb_data and tmdb_data['backdrop_path'] and not screen_work.backdrop_path:
                # Use 'original' for highest quality backdrop images
                screen_work.backdrop_path = f"https://image.tmdb.org/t/p/original{tmdb_data['backdrop_path']}"

            # Set year from release date
            if screen_work.type == 'MOVIE' and 'release_date' in tmdb_data and not screen_work.year:
                release_date = tmdb_data['release_date']
                if release_date:
                    screen_work.year = int(release_date[:4])
            elif screen_work.type == 'TV' and 'first_air_date' in tmdb_data and not screen_work.year:
                first_air = tmdb_data['first_air_date']
                if first_air:
                    screen_work.year = int(first_air[:4])

            # Extract TMDb popularity for ranking
            if 'popularity' in tmdb_data:
                screen_work.tmdb_popularity = tmdb_data['popularity']

            # Extract ratings from TMDb
            if 'vote_average' in tmdb_data and tmdb_data['vote_average']:
                screen_work.average_rating = tmdb_data['vote_average']
            if 'vote_count' in tmdb_data and tmdb_data['vote_count']:
                screen_work.ratings_count = tmdb_data['vote_count']

            # Extract and store genres
            primary_genre, all_genres = extract_genres_from_tmdb(tmdb_data)
            if primary_genre:
                screen_work.primary_genre = primary_genre
                screen_work.genres = all_genres

            # Fetch director/creator information
            if not screen_work.director:
                if screen_work.type == 'MOVIE':
                    # For movies, fetch from credits endpoint
                    credits_url = f"https://api.themoviedb.org/3/movie/{screen_work.tmdb_id}/credits"
                    try:
                        credits_response = requests.get(credits_url, params={'api_key': settings.TMDB_API_KEY}, timeout=10)
                        credits_response.raise_for_status()
                        credits_data = credits_response.json()

                        # Find director in crew
                        crew = credits_data.get('crew', [])
                        directors = [person['name'] for person in crew if person.get('job') == 'Director']
                        if directors:
                            # Use first director, or combine multiple with '&' if there are 2
                            screen_work.director = directors[0] if len(directors) == 1 else f"{directors[0]} & {directors[1]}"
                    except Exception as e:
                        print(f"Failed to fetch director from credits: {e}")
                elif screen_work.type == 'TV':
                    # For TV series, use 'created_by' from main details
                    created_by = tmdb_data.get('created_by', [])
                    if created_by:
                        creators = [creator['name'] for creator in created_by if creator.get('name')]
                        if creators:
                            # Use first creator, or combine multiple with '&' if there are 2
                            screen_work.director = creators[0] if len(creators) == 1 else f"{creators[0]} & {creators[1]}"

            # Fetch watch providers (JustWatch data via TMDb)
            if not screen_work.watch_providers:
                providers_url = f"https://api.themoviedb.org/3/{media_type}/{screen_work.tmdb_id}/watch/providers"
                try:
                    providers_response = requests.get(providers_url, params={'api_key': settings.TMDB_API_KEY}, timeout=10)
                    providers_response.raise_for_status()
                    providers_data = providers_response.json()

                    # Store the results (keyed by country code)
                    if 'results' in providers_data:
                        screen_work.watch_providers = providers_data['results']
                except Exception as e:
                    print(f"Failed to fetch watch providers: {e}")

            screen_work.save()

            # Return genre info for potential book sync
            return {
                'success': True,
                'screen_work_id': screen_work_id,
                'primary_genre': primary_genre,
                'genres': all_genres
            }

    except ScreenWork.DoesNotExist:
        return {'success': False, 'error': 'ScreenWork not found'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

    return {'success': False, 'error': 'No TMDb ID found'}
