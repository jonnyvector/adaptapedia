"""Open Library Covers API integration for fetching book covers."""
import requests
from typing import Optional


OPENLIBRARY_COVERS_API = "https://covers.openlibrary.org/b"
OPENLIBRARY_SEARCH_API = "https://openlibrary.org/search.json"


def get_cover_by_title(title: str, author: Optional[str] = None, size: str = 'L') -> Optional[str]:
    """
    Get book cover URL from Open Library by searching for title.

    Args:
        title: Book title
        author: Optional author name to narrow search
        size: Cover size - 'S' (small), 'M' (medium), or 'L' (large)

    Returns:
        Cover image URL or None if not found
    """
    # Search for the book
    query = title
    if author:
        query += f' {author}'

    params = {
        'q': query,
        'limit': 10,
        'fields': 'key,title,author_name,cover_i,first_publish_year',
    }

    # Exclude keywords for study guides
    exclude_keywords = [
        'sparknotes', 'cliffsnotes', 'study guide', 'summary',
        'analysis', 'companion', 'york notes'
    ]

    try:
        response = requests.get(OPENLIBRARY_SEARCH_API, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        if not data.get('docs'):
            return None

        # Find first non-study-guide result with a cover
        for doc in data['docs']:
            doc_title = doc.get('title', '').lower()

            # Skip study guides
            is_study_guide = any(keyword in doc_title for keyword in exclude_keywords)
            if is_study_guide:
                continue

            cover_id = doc.get('cover_i')
            if cover_id:
                return f"{OPENLIBRARY_COVERS_API}/id/{cover_id}-{size}.jpg"

        return None

    except requests.RequestException as e:
        print(f"Error fetching from Open Library API: {e}")
        return None


def get_cover_by_isbn(isbn: str, size: str = 'L') -> Optional[str]:
    """
    Get book cover URL from Open Library by ISBN.

    Args:
        isbn: ISBN-10 or ISBN-13
        size: Cover size - 'S' (small), 'M' (medium), or 'L' (large)

    Returns:
        Cover image URL or None if not available
    """
    # Open Library doesn't return 404 for missing covers, so we need to check
    url = f"{OPENLIBRARY_COVERS_API}/isbn/{isbn}-{size}.jpg"

    try:
        # HEAD request to check if cover exists
        response = requests.head(url, timeout=5, allow_redirects=True)

        # Open Library redirects to a default image if no cover exists
        # The actual cover will be at the original URL
        if response.status_code == 200 and 'default' not in response.url:
            return url

        return None

    except requests.RequestException:
        return None


def get_cover_by_olid(olid: str, size: str = 'L') -> Optional[str]:
    """
    Get book cover URL from Open Library by Open Library ID.

    Args:
        olid: Open Library ID (e.g., 'OL123456M')
        size: Cover size - 'S' (small), 'M' (medium), or 'L' (large)

    Returns:
        Cover image URL
    """
    return f"{OPENLIBRARY_COVERS_API}/olid/{olid}-{size}.jpg"
