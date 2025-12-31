"""Custom throttle classes for rate limiting."""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """
    Rate limit for authentication endpoints.

    Protects against brute force attacks and credential stuffing.
    Limit: 5 requests per minute for anonymous users.
    """
    scope = 'auth'
    rate = '5/min'


class SearchRateThrottle(AnonRateThrottle):
    """
    Rate limit for search endpoints.

    Prevents search API abuse and excessive load.
    Limit: 30 requests per minute for anonymous users.
    """
    scope = 'search'
    rate = '30/min'


class PublicListRateThrottle(AnonRateThrottle):
    """
    Rate limit for public list endpoints.

    Prevents excessive scraping and data harvesting.
    Limit: 60 requests per minute for anonymous users.
    """
    scope = 'public_list'
    rate = '60/min'


class AuthenticatedUserRateThrottle(UserRateThrottle):
    """
    Rate limit for authenticated users.

    More generous limits for logged-in users.
    Limit: 300 requests per minute.
    """
    scope = 'user'
    rate = '300/min'
