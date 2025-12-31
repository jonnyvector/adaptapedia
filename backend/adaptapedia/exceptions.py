"""Custom exception handlers for consistent error responses."""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.

    Ensures consistent error response format across all API endpoints:
    {
        "error": "Human-readable error message",
        "detail": "Optional detailed error information",
        "request_id": "UUID for request tracking",
        "status_code": 400
    }

    All errors include the request_id from RequestIDMiddleware for correlation.
    """
    # Get the standard DRF error response
    response = drf_exception_handler(exc, context)

    # Get request from context
    request = context.get('request')
    request_id = getattr(request, 'id', 'unknown') if request else 'unknown'

    if response is not None:
        # Standardize error response format
        custom_response_data = {
            'error': _get_error_message(exc, response),
            'request_id': request_id,
            'status_code': response.status_code,
        }

        # Add detail if available
        detail = _get_error_detail(response.data)
        if detail:
            custom_response_data['detail'] = detail

        # Log the error for monitoring
        logger.warning(
            f"[{request_id}] API Error: {custom_response_data['error']} - Status: {response.status_code}",
            extra={
                'request_id': request_id,
                'status_code': response.status_code,
                'exception_type': exc.__class__.__name__,
                'path': request.path if request else 'unknown',
            }
        )

        response.data = custom_response_data

    else:
        # Handle non-DRF exceptions (500 errors)
        logger.error(
            f"[{request_id}] Unhandled exception: {exc}",
            exc_info=True,
            extra={
                'request_id': request_id,
                'exception_type': exc.__class__.__name__,
                'path': request.path if request else 'unknown',
            }
        )

        response = Response(
            {
                'error': 'An unexpected error occurred. Please try again later.',
                'request_id': request_id,
                'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response


def _get_error_message(exc, response):
    """Extract a human-readable error message from the exception."""
    # Check if DRF provided a detail message
    if hasattr(exc, 'detail'):
        detail = exc.detail
        if isinstance(detail, str):
            return detail
        elif isinstance(detail, dict):
            # Try common keys
            for key in ['detail', 'message', 'error']:
                if key in detail:
                    value = detail[key]
                    if isinstance(value, str):
                        return value
                    elif isinstance(value, list) and value:
                        return str(value[0])
            # Fall back to first value
            first_value = next(iter(detail.values()), None)
            if first_value:
                if isinstance(first_value, str):
                    return first_value
                elif isinstance(first_value, list) and first_value:
                    return str(first_value[0])
        elif isinstance(detail, list) and detail:
            return str(detail[0])

    # Fall back to exception class name
    return exc.__class__.__name__.replace('_', ' ').title()


def _get_error_detail(response_data):
    """Extract detailed error information if available."""
    if isinstance(response_data, dict):
        # Remove 'detail' key if it's already used in the main message
        detail_copy = response_data.copy()
        detail_copy.pop('detail', None)

        # Return remaining fields as detail if there are any
        if detail_copy:
            return detail_copy

    # Don't return list details for simple validation errors
    # (they just duplicate the error message)
    return None
