"""Username service for generating and validating usernames."""
import hashlib
from typing import Optional
from django.contrib.auth import get_user_model

User = get_user_model()


def generate_temp_username(provider: str, uid: str) -> str:
    """
    Generate a temporary username for social auth users.

    Format: {provider}_{hash}
    Example: google_abc12345

    Args:
        provider: Social auth provider (e.g., 'google', 'facebook')
        uid: User ID from the provider

    Returns:
        Temporary username string
    """
    # Take first 8 characters of the UID hash for brevity
    uid_hash = hashlib.md5(uid.encode()).hexdigest()[:8]
    temp_username = f"{provider}_{uid_hash}"

    # Ensure uniqueness by appending a number if needed
    base_username = temp_username
    counter = 1
    while User.objects.filter(username=temp_username).exists():
        temp_username = f"{base_username}{counter}"
        counter += 1

    return temp_username


def is_temp_username(username: str) -> bool:
    """
    Check if a username is a temporary social auth username.

    Args:
        username: Username to check

    Returns:
        True if username matches temp pattern (provider_hash)
    """
    valid_providers = ['google', 'facebook', 'github', 'twitter']

    for provider in valid_providers:
        if username.startswith(f"{provider}_"):
            # Check if the part after provider_ looks like a hash
            suffix = username[len(provider) + 1:]
            # Temp usernames should have 8+ hex characters or hex + digits
            if len(suffix) >= 8 and all(c in '0123456789abcdef' for c in suffix[:8]):
                return True

    return False


def validate_username(username: str) -> tuple[bool, Optional[str]]:
    """
    Validate a username for registration.

    Args:
        username: Username to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    # Length check
    if len(username) < 3:
        return False, "Username must be at least 3 characters long"

    if len(username) > 30:
        return False, "Username must be at most 30 characters long"

    # Character check (alphanumeric, underscore, hyphen only)
    if not all(c.isalnum() or c in ('_', '-') for c in username):
        return False, "Username can only contain letters, numbers, underscores, and hyphens"

    # Must start with a letter or number
    if not username[0].isalnum():
        return False, "Username must start with a letter or number"

    # Cannot be a temp username pattern
    if is_temp_username(username):
        return False, "Username cannot use social auth temporary format"

    # Check uniqueness
    if User.objects.filter(username=username).exists():
        return False, "Username is already taken"

    return True, None
