"""Custom views for social authentication with JWT."""
from django.shortcuts import redirect
from django.views import View
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.models import SocialAccount
import urllib.parse


class SocialAuthCallbackView(View):
    """Handle social auth callback and generate JWT tokens."""

    def get(self, request):
        """Generate JWT tokens and redirect to frontend with tokens."""
        if not request.user.is_authenticated:
            # User not authenticated, redirect to login
            return redirect('http://localhost:3000/auth/login?error=auth_failed')

        try:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(request.user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Build frontend URL with tokens
            frontend_url = 'http://localhost:3000/auth/social-callback'
            params = {
                'access': access_token,
                'refresh': refresh_token,
            }

            redirect_url = f"{frontend_url}?{urllib.parse.urlencode(params)}"
            return redirect(redirect_url)

        except Exception as e:
            # Log error and redirect to frontend with error message
            print(f"Social auth error: {e}")
            return redirect('http://localhost:3000/auth/login?error=token_generation_failed')
