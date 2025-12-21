"""Google Books API integration for fetching book metadata."""
import requests
from typing import Optional, Dict, Any


GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"


def search_book(title: str, author: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Search for a book using Google Books API.

    Args:
        title: Book title to search for
        author: Optional author name to narrow search

    Returns:
        Dictionary with book data or None if not found
    """
    # Build search query
    query = f'intitle:"{title}"'
    if author:
        query += f' inauthor:"{author}"'

    params = {
        'q': query,
        'maxResults': 10,  # Get more results to filter through
        'printType': 'books',
        'langRestrict': 'en'
    }

    try:
        response = requests.get(GOOGLE_BOOKS_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if 'items' not in data or len(data['items']) == 0:
            return None

        # Filter out study guides, SparkNotes, summaries, etc.
        exclude_keywords = [
            'sparknotes', 'cliffsnotes', 'study guide', 'summary',
            'analysis', 'companion', 'york notes', 'cliff notes',
            'bookrags', 'shmoop', 'litcharts', 'gradesaver'
        ]

        for item in data['items']:
            vol_info = item.get('volumeInfo', {})
            item_title = vol_info.get('title', '').lower()
            item_subtitle = vol_info.get('subtitle', '').lower()
            item_description = vol_info.get('description', '').lower()

            # Skip if title contains exclusion keywords
            is_study_guide = any(keyword in item_title for keyword in exclude_keywords)
            is_study_subtitle = any(keyword in item_subtitle for keyword in exclude_keywords)

            # Also check if it's labeled as a study guide in description
            if not is_study_guide and not is_study_subtitle:
                # Check if there are actual images available
                if vol_info.get('imageLinks'):
                    return parse_book_data(item)

        # If no good match found after filtering, return first result with images
        for item in data['items']:
            if item.get('volumeInfo', {}).get('imageLinks'):
                return parse_book_data(item)

        # Last resort - return first result
        return parse_book_data(data['items'][0])

    except requests.RequestException as e:
        print(f"Error fetching from Google Books API: {e}")
        return None


def parse_book_data(volume_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse Google Books API volume data into a clean format.

    Args:
        volume_data: Raw volume data from API

    Returns:
        Dictionary with parsed book data
    """
    volume_info = volume_data.get('volumeInfo', {})

    # Get the best quality cover image
    image_links = volume_info.get('imageLinks', {})
    cover_url = (
        image_links.get('extraLarge') or
        image_links.get('large') or
        image_links.get('medium') or
        image_links.get('thumbnail') or
        image_links.get('smallThumbnail') or
        None
    )

    # Upgrade to higher resolution
    if cover_url:
        # Remove edge curl and switch to HTTPS
        cover_url = cover_url.replace('&edge=curl', '').replace('http://', 'https://')

        # Remove zoom parameter if exists and add higher zoom
        if 'zoom=' in cover_url:
            import re
            cover_url = re.sub(r'&zoom=\d+', '', cover_url)

        # Request highest quality version
        # zoom=3 gives much better quality than zoom=1
        cover_url += '&zoom=3'

        # If it's a thumbnail URL, try to get the full-size version
        if 'printsec=frontcover' not in cover_url and 'id=' in cover_url:
            # Extract book ID and construct better URL
            import re
            book_id_match = re.search(r'id=([^&]+)', cover_url)
            if book_id_match:
                book_id = book_id_match.group(1)
                # Use the high-quality API endpoint
                cover_url = f'https://books.google.com/books/content?id={book_id}&printsec=frontcover&img=1&zoom=3&source=gbs_api'

    # Get authors
    authors = volume_info.get('authors', [])
    author = authors[0] if authors else None

    # Get publication year
    published_date = volume_info.get('publishedDate', '')
    year = None
    if published_date:
        try:
            year = int(published_date.split('-')[0])
        except (ValueError, IndexError):
            pass

    # Get ISBNs
    isbn_10 = None
    isbn_13 = None
    for identifier in volume_info.get('industryIdentifiers', []):
        if identifier.get('type') == 'ISBN_10':
            isbn_10 = identifier.get('identifier')
        elif identifier.get('type') == 'ISBN_13':
            isbn_13 = identifier.get('identifier')

    # Get genres/categories (take first category if available)
    categories = volume_info.get('categories', [])
    genre = categories[0] if categories else None

    return {
        'title': volume_info.get('title'),
        'author': author,
        'authors': authors,
        'description': volume_info.get('description'),
        'published_date': published_date,
        'year': year,
        'publisher': volume_info.get('publisher'),
        'page_count': volume_info.get('pageCount'),
        'language': volume_info.get('language'),
        'genre': genre,
        'isbn_10': isbn_10,
        'isbn_13': isbn_13,
        'cover_url': cover_url,
        'google_books_id': volume_data.get('id'),
    }


def get_book_by_isbn(isbn: str) -> Optional[Dict[str, Any]]:
    """
    Get book data by ISBN.

    Args:
        isbn: ISBN-10 or ISBN-13

    Returns:
        Dictionary with book data or None if not found
    """
    params = {
        'q': f'isbn:{isbn}',
    }

    try:
        response = requests.get(GOOGLE_BOOKS_API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if 'items' not in data or len(data['items']) == 0:
            return None

        return parse_book_data(data['items'][0])

    except requests.RequestException as e:
        print(f"Error fetching from Google Books API: {e}")
        return None
