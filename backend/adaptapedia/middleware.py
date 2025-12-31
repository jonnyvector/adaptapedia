"""Custom middleware for Adaptapedia."""
import uuid
import logging
import time

logger = logging.getLogger(__name__)


class RequestIDMiddleware:
    """
    Middleware to add a unique request ID to each request.

    The request ID is:
    - Generated as a UUID4
    - Stored in request.id
    - Added to response headers as X-Request-ID
    - Available for logging throughout the request lifecycle
    """

    def __init__(self, get_response):
        """Initialize middleware."""
        self.get_response = get_response

    def __call__(self, request):
        """Process request and add request ID."""
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        request.id = request_id

        # Add to response headers
        response = self.get_response(request)
        response['X-Request-ID'] = request_id

        return response


class RequestLoggingMiddleware:
    """
    Middleware to log all incoming requests and responses.

    Logs include:
    - Request ID (from RequestIDMiddleware)
    - HTTP method and path
    - Response status code
    - Request duration
    - User information (if authenticated)
    """

    def __init__(self, get_response):
        """Initialize middleware."""
        self.get_response = get_response

    def __call__(self, request):
        """Log request and response details."""
        # Start timer
        start_time = time.time()

        # Get request ID (set by RequestIDMiddleware)
        request_id = getattr(request, 'id', 'unknown')

        # Log incoming request
        user_info = request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
        logger.info(
            f"[{request_id}] {request.method} {request.path} - User: {user_info}",
            extra={
                'request_id': request_id,
                'method': request.method,
                'path': request.path,
                'user': user_info,
                'remote_addr': self._get_client_ip(request),
            }
        )

        # Process request
        response = self.get_response(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log response
        logger.info(
            f"[{request_id}] {request.method} {request.path} - {response.status_code} ({duration:.3f}s)",
            extra={
                'request_id': request_id,
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': duration,
                'user': user_info,
            }
        )

        return response

    def _get_client_ip(self, request):
        """Get the client IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
