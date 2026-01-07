"""Cache utilities for Adaptapedia.

Provides caching decorators and utilities optimized for Railway deployment.
"""
from functools import wraps
from typing import Any, Callable, Optional
from django.core.cache import cache
from django.conf import settings


# Cache timeouts (in seconds)
CACHE_TIMEOUTS = {
    'search_results': 300,      # 5 minutes - search results change as content is added
    'book_detail': 3600,         # 1 hour - book metadata rarely changes
    'screen_detail': 3600,       # 1 hour - screen metadata rarely changes
    'comparison': 600,           # 10 minutes - comparisons change with new diffs/votes
    'top_diffs': 1800,           # 30 minutes - top diffs change with voting
    'user_profile': 300,         # 5 minutes - user data changes with activity
    'browse_list': 900,          # 15 minutes - browse lists change slowly
    'stats': 3600,               # 1 hour - site stats updated by celery task
}


def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate a cache key from prefix and arguments.

    Args:
        prefix: Cache key prefix (e.g., 'book_detail', 'search')
        *args: Positional arguments to include in key
        **kwargs: Keyword arguments to include in key

    Returns:
        Formatted cache key string
    """
    parts = [prefix]

    # Add positional args
    for arg in args:
        parts.append(str(arg))

    # Add sorted keyword args for consistency
    for key in sorted(kwargs.keys()):
        parts.append(f"{key}:{kwargs[key]}")

    return ':'.join(parts)


def cache_view(
    key_prefix: str,
    timeout: Optional[int] = None,
    key_func: Optional[Callable] = None
) -> Callable:
    """Decorator to cache view results.

    Args:
        key_prefix: Prefix for cache key (e.g., 'book_detail')
        timeout: Cache timeout in seconds (uses CACHE_TIMEOUTS[key_prefix] if None)
        key_func: Optional function to generate cache key from request
                  Signature: key_func(request, *args, **kwargs) -> str

    Usage:
        @cache_view('book_detail', timeout=3600)
        def get_book(request, slug):
            ...

        @cache_view('search', key_func=lambda req, *args, **kw: f"q:{req.GET.get('q')}")
        def search(request):
            ...
    """
    def decorator(view_func: Callable) -> Callable:
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            # Generate cache key
            if key_func:
                cache_suffix = key_func(request, *args, **kwargs)
                cache_key = f"{key_prefix}:{cache_suffix}"
            else:
                cache_key = get_cache_key(key_prefix, *args, **kwargs)

            # Try to get from cache
            cached_response = cache.get(cache_key)
            if cached_response is not None:
                return cached_response

            # Execute view and cache result
            response = view_func(request, *args, **kwargs)

            # Determine timeout
            cache_timeout = timeout if timeout is not None else CACHE_TIMEOUTS.get(key_prefix, 300)

            # Only cache successful responses (status 200-299)
            if hasattr(response, 'status_code') and 200 <= response.status_code < 300:
                cache.set(cache_key, response, cache_timeout)

            return response

        return wrapper
    return decorator


def invalidate_cache(key_prefix: str, *args, **kwargs) -> None:
    """Invalidate a specific cache entry.

    Args:
        key_prefix: Cache key prefix
        *args: Positional arguments used to generate the key
        **kwargs: Keyword arguments used to generate the key
    """
    cache_key = get_cache_key(key_prefix, *args, **kwargs)
    cache.delete(cache_key)


def invalidate_pattern(pattern: str) -> None:
    """Invalidate all cache keys matching a pattern.

    Note: This requires Redis and uses SCAN command.
    Only use when necessary as it can be expensive.

    Args:
        pattern: Cache key pattern (e.g., 'book:*', 'search:*')
    """
    try:
        # Get Redis client from cache backend
        redis_client = cache._cache.get_client()

        # Scan for matching keys
        cursor = 0
        while True:
            cursor, keys = redis_client.scan(
                cursor=cursor,
                match=f"adaptapedia:{pattern}",  # Include cache key prefix
                count=100
            )

            if keys:
                redis_client.delete(*keys)

            if cursor == 0:
                break

    except AttributeError:
        # Not using Redis backend, skip pattern invalidation
        pass


def cache_get_or_set(key: str, default_func: Callable, timeout: int = 300) -> Any:
    """Get value from cache or set it using default_func.

    Args:
        key: Cache key
        default_func: Function to call if cache miss (should return value to cache)
        timeout: Cache timeout in seconds

    Returns:
        Cached value or result of default_func
    """
    value = cache.get(key)
    if value is None:
        value = default_func()
        cache.set(key, value, timeout)
    return value


# Specific cache helpers for common use cases

def cache_book_detail(slug: str, data: dict) -> None:
    """Cache book detail data."""
    cache_key = get_cache_key('book_detail', slug)
    cache.set(cache_key, data, CACHE_TIMEOUTS['book_detail'])


def get_cached_book_detail(slug: str) -> Optional[dict]:
    """Get cached book detail data."""
    cache_key = get_cache_key('book_detail', slug)
    return cache.get(cache_key)


def invalidate_book_detail(slug: str) -> None:
    """Invalidate book detail cache."""
    invalidate_cache('book_detail', slug)


def cache_screen_detail(slug: str, data: dict) -> None:
    """Cache screen detail data."""
    cache_key = get_cache_key('screen_detail', slug)
    cache.set(cache_key, data, CACHE_TIMEOUTS['screen_detail'])


def get_cached_screen_detail(slug: str) -> Optional[dict]:
    """Get cached screen detail data."""
    cache_key = get_cache_key('screen_detail', slug)
    return cache.get(cache_key)


def invalidate_screen_detail(slug: str) -> None:
    """Invalidate screen detail cache."""
    invalidate_cache('screen_detail', slug)


def cache_comparison(book_slug: str, screen_slug: str, data: dict) -> None:
    """Cache comparison data."""
    cache_key = get_cache_key('comparison', book_slug, screen_slug)
    cache.set(cache_key, data, CACHE_TIMEOUTS['comparison'])


def get_cached_comparison(book_slug: str, screen_slug: str) -> Optional[dict]:
    """Get cached comparison data."""
    cache_key = get_cache_key('comparison', book_slug, screen_slug)
    return cache.get(cache_key)


def invalidate_comparison(book_slug: str, screen_slug: str) -> None:
    """Invalidate comparison cache."""
    invalidate_cache('comparison', book_slug, screen_slug)


def cache_search_results(query: str, filters: dict, data: dict) -> None:
    """Cache search results."""
    cache_key = get_cache_key('search_results', query, **filters)
    cache.set(cache_key, data, CACHE_TIMEOUTS['search_results'])


def get_cached_search_results(query: str, filters: dict) -> Optional[dict]:
    """Get cached search results."""
    cache_key = get_cache_key('search_results', query, **filters)
    return cache.get(cache_key)
