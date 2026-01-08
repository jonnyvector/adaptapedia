"""Username validation and generation service."""
import re
import random
from datetime import datetime
from django.contrib.auth import get_user_model
from users.constants import RESERVED_USERNAMES, PROFANITY_BLOCKLIST

User = get_user_model()


def validate_username_format(username: str) -> tuple[bool, str | None]:
    """
    Validate username format rules.

    Returns: (is_valid, error_message)
    """
    # Length check: 3-20 characters
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    if len(username) > 20:
        return False, "Username must be 20 characters or less"

    # Character check: alphanumeric + underscores only
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores"

    return True, None


def check_reserved_username(username: str) -> bool:
    """Check if username is reserved. Returns True if reserved."""
    return username.lower() in RESERVED_USERNAMES


def check_profanity(username: str) -> bool:
    """Check if username contains profanity. Returns True if profane."""
    username_lower = username.lower()
    return any(word in username_lower for word in PROFANITY_BLOCKLIST)


def validate_username(username: str) -> tuple[bool, str | None]:
    """
    Complete username validation.

    Returns: (is_valid, error_code)
    Error codes: 'invalid_format', 'reserved', 'profanity', None if valid
    """
    # Format validation
    is_valid, error_msg = validate_username_format(username)
    if not is_valid:
        return False, 'invalid_format'

    # Reserved check
    if check_reserved_username(username):
        return False, 'reserved'

    # Profanity check
    if check_profanity(username):
        return False, 'profanity'

    return True, None


def check_username_availability(username: str) -> bool:
    """
    Check if username is available (case-insensitive).

    Returns True if available, False if taken.
    """
    return not User.objects.filter(username__iexact=username).exists()


def generate_username_suggestions(base_name: str | None = None, count: int = 5) -> list[str]:
    """
    Generate username suggestions.

    Args:
        base_name: Optional base (e.g., from social auth profile)
        count: Number of suggestions to generate

    Returns: List of available usernames
    """
    suggestions = []

    if base_name:
        # Clean base name (remove spaces, special chars)
        clean_base = re.sub(r'[^a-zA-Z0-9]', '', base_name.lower())

        # Try variations if clean_base is valid length
        if len(clean_base) >= 3:
            suggestions.extend([
                clean_base,
                f"{clean_base}_{random.randint(1, 999)}",
                f"{clean_base}_reader",
                f"{clean_base}_fan",
            ])

    # Generic suggestions
    prefixes = ['bookworm', 'movie_buff', 'reader', 'cinephile', 'adaptafan']
    suffixes = ['x', str(random.randint(1, 9999)), str(datetime.now().year)]

    for prefix in prefixes[:3]:
        suggestions.append(f"{prefix}_{random.choice(suffixes)}")

    # Filter out invalid/taken usernames
    available_suggestions = []
    for username in suggestions:
        # Skip if too long after generation
        if len(username) > 20:
            continue

        # Validate and check availability
        is_valid, _ = validate_username(username)
        if is_valid and check_username_availability(username):
            available_suggestions.append(username)
            if len(available_suggestions) >= count:
                break

    return available_suggestions[:count]


def generate_temp_username(provider: str, uid: str) -> str:
    """
    Generate temporary username for social auth users.

    Format: {provider}_{uid[:8]}
    """
    return f"{provider}_{uid[:8]}"
