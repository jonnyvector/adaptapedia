"""URL configuration for Adaptapedia."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from users.social_auth_views import SocialAuthCallbackView


def health_check(request):
    """Simple health check endpoint."""
    return JsonResponse({'status': 'healthy', 'service': 'adaptapedia-api'})


urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Social authentication
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/callback/', SocialAuthCallbackView.as_view(), name='social_auth_callback'),
    path('accounts/', include('allauth.urls')),  # Allauth needs to be at /accounts/ for OAuth callbacks
    # App endpoints
    path('api/works/', include('works.urls')),
    path('api/screen/', include('screen.urls')),
    path('api/diffs/', include('diffs.urls')),
    path('api/users/', include('users.urls')),
    path('api/mod/', include('moderation.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
