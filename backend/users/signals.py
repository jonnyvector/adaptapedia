"""Signal handlers for user-related events."""
from django.dispatch import receiver
from allauth.socialaccount.signals import pre_social_login
from django.utils import timezone
from users.username_service import generate_temp_username


@receiver(pre_social_login)
def populate_temp_username(sender, request, sociallogin, **kwargs):
    """
    Generate temporary username for new social auth users.
    Existing users are skipped.

    This signal fires before a social auth user is created in the database.
    We generate a temporary username like 'google_abc12345' and set the user
    to require username selection during onboarding.

    Args:
        sender: Signal sender
        request: HTTP request object
        sociallogin: SocialLogin object containing user and account info
        **kwargs: Additional keyword arguments
    """
    # Skip if this is an existing user logging in
    if sociallogin.is_existing:
        return

    user = sociallogin.user
    provider = sociallogin.account.provider
    uid = sociallogin.account.uid

    # Generate temporary username
    temp_username = generate_temp_username(provider, uid)
    user.username = temp_username

    # Set onboarding state
    user.onboarding_completed = False
    user.onboarding_step = 1  # Username selection required
    user.onboarding_started_at = timezone.now()
