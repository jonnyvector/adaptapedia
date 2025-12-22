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
)

# Router for users (at /api/users/<username>)
user_router = DefaultRouter()
user_router.register(r'', UserViewSet, basename='user')

# Router for bookmarks (at /api/users/bookmarks/)
bookmark_router = DefaultRouter()
bookmark_router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')

urlpatterns = [
    # Authentication endpoints
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    # Bookmark endpoints (must come before user router to avoid conflicts)
    path('', include(bookmark_router.urls)),
    # User CRUD endpoints
    path('', include(user_router.urls)),
]
