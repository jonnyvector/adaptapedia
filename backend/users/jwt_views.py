"""Custom JWT views with rate limiting."""
from rest_framework_simplejwt.views import (
    TokenObtainPairView as BaseTokenObtainPairView,
    TokenRefreshView as BaseTokenRefreshView,
)
from adaptapedia.throttles import AuthRateThrottle


class TokenObtainPairView(BaseTokenObtainPairView):
    """JWT token obtain view with rate limiting."""
    throttle_classes = [AuthRateThrottle]


class TokenRefreshView(BaseTokenRefreshView):
    """JWT token refresh view with rate limiting."""
    throttle_classes = [AuthRateThrottle]
