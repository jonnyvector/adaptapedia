"""URL configuration for Adaptapedia."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.jwt_views import TokenObtainPairView, TokenRefreshView
from .health import health_check, readiness_check, liveness_check

urlpatterns = [
    # Health checks (no authentication required)
    path('health/', health_check, name='health'),
    path('ready/', readiness_check, name='readiness'),
    path('live/', liveness_check, name='liveness'),
    # Admin and API
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/works/', include('works.urls')),
    path('api/screen/', include('screen.urls')),
    path('api/diffs/', include('diffs.urls')),
    path('api/users/', include('users.urls')),
    path('api/mod/', include('moderation.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
