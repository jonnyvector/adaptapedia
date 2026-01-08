"""URL configuration for users app."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    SignupView,
    LoginView,
    LogoutView,
    CurrentUserView,
    BookmarkViewSet,
    NotificationViewSet,
    check_username,
    set_username,
    set_preferences,
    suggested_comparisons,
    update_onboarding,
)

# Router for users (at /api/users/<username>)
user_router = DefaultRouter()
user_router.register(r'', UserViewSet, basename='user')

# Router for bookmarks (at /api/users/bookmarks/)
bookmark_router = DefaultRouter()
bookmark_router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')

# Router for notifications (at /api/users/notifications/)
notification_router = DefaultRouter()
notification_router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    # Authentication endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    # Onboarding endpoints
    path('me/username/check/', check_username, name='check-username'),
    path('me/username/', set_username, name='set-username'),
    path('me/preferences/', set_preferences, name='set-preferences'),
    path('me/suggested-comparisons/', suggested_comparisons, name='suggested-comparisons'),
    path('me/onboarding/', update_onboarding, name='update-onboarding'),
    # Notification endpoints
    path('', include(notification_router.urls)),
    # Bookmark endpoints (must come before user router to avoid conflicts)
    path('', include(bookmark_router.urls)),
    # User CRUD endpoints
    path('', include(user_router.urls)),
]
