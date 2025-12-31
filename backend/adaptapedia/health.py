"""Health check endpoints for monitoring and load balancers."""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


def health_check(request):
    """
    Basic health check endpoint.

    Checks:
    - Database connectivity
    - Cache (Redis) connectivity

    Returns:
    - 200 OK if healthy
    - 503 Service Unavailable if unhealthy
    """
    checks = {
        'database': False,
        'cache': False,
    }
    errors = []

    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            checks['database'] = True
    except Exception as e:
        errors.append(f"Database: {str(e)}")
        logger.error(f"Health check failed: Database error - {str(e)}")

    # Check cache (Redis)
    try:
        cache.set('health_check', 'ok', timeout=10)
        result = cache.get('health_check')
        if result == 'ok':
            checks['cache'] = True
        else:
            errors.append("Cache: Failed to read test value")
    except Exception as e:
        errors.append(f"Cache: {str(e)}")
        logger.error(f"Health check failed: Cache error - {str(e)}")

    # Determine overall status
    all_healthy = all(checks.values())
    status_code = 200 if all_healthy else 503

    response_data = {
        'status': 'healthy' if all_healthy else 'unhealthy',
        'checks': checks,
    }

    if errors:
        response_data['errors'] = errors

    return JsonResponse(response_data, status=status_code)


def readiness_check(request):
    """
    Readiness check for Kubernetes/orchestration systems.

    This endpoint indicates if the app is ready to receive traffic.
    Currently identical to health_check, but can be extended for
    additional readiness criteria (e.g., migrations complete,
    background workers running).

    Returns:
    - 200 OK if ready
    - 503 Service Unavailable if not ready
    """
    # For now, same as health check
    # Can be extended with additional checks like:
    # - Celery workers available
    # - Required environment variables set
    # - Database migrations up to date
    return health_check(request)


def liveness_check(request):
    """
    Liveness check for Kubernetes/orchestration systems.

    This is a minimal check that the app is running and can
    respond to requests. Does NOT check external dependencies.

    Always returns 200 OK unless the app is completely broken.
    """
    return JsonResponse({
        'status': 'alive',
        'service': 'adaptapedia-backend',
    })
