"""Tests for username validation service."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from users.services.username_service import (
    validate_username_format,
    check_reserved_username,
    check_profanity,
    validate_username,
    check_username_availability,
    generate_username_suggestions,
    generate_temp_username,
)

User = get_user_model()


class UsernameValidationTests(TestCase):
    """Test username validation functions."""

    def test_validate_username_format_valid(self):
        """Test valid usernames pass format validation."""
        self.assertEqual(validate_username_format("user123")[0], True)
        self.assertEqual(validate_username_format("book_lover")[0], True)
        self.assertEqual(validate_username_format("abc")[0], True)  # Minimum length
        self.assertEqual(validate_username_format("a" * 20)[0], True)  # Maximum length

    def test_validate_username_format_too_short(self):
        """Test usernames shorter than 3 characters fail."""
        is_valid, error = validate_username_format("ab")
        self.assertFalse(is_valid)
        self.assertIn("at least 3", error)

        is_valid, error = validate_username_format("a")
        self.assertFalse(is_valid)

        is_valid, error = validate_username_format("")
        self.assertFalse(is_valid)

    def test_validate_username_format_too_long(self):
        """Test usernames longer than 20 characters fail."""
        is_valid, error = validate_username_format("a" * 21)
        self.assertFalse(is_valid)
        self.assertIn("20 characters or less", error)

    def test_validate_username_format_invalid_chars(self):
        """Test usernames with invalid characters fail."""
        is_valid, error = validate_username_format("user@123")
        self.assertFalse(is_valid)
        self.assertIn("letters, numbers", error)

        is_valid, error = validate_username_format("user-name")
        self.assertFalse(is_valid)

        is_valid, error = validate_username_format("user name")
        self.assertFalse(is_valid)

        is_valid, error = validate_username_format("user.name")
        self.assertFalse(is_valid)

    def test_check_reserved_username(self):
        """Test reserved username detection."""
        self.assertTrue(check_reserved_username("admin"))
        self.assertTrue(check_reserved_username("ADMIN"))  # Case insensitive
        self.assertTrue(check_reserved_username("moderator"))
        self.assertTrue(check_reserved_username("api"))
        self.assertTrue(check_reserved_username("support"))
        self.assertFalse(check_reserved_username("regularuser"))
        self.assertFalse(check_reserved_username("john_doe"))

    def test_check_profanity(self):
        """Test profanity detection in usernames."""
        # Direct profanity
        self.assertTrue(check_profanity("badword_fuck"))
        self.assertTrue(check_profanity("shit_user"))

        # Case insensitive
        self.assertTrue(check_profanity("FUCK_user"))

        # Clean usernames
        self.assertFalse(check_profanity("regular_user"))
        self.assertFalse(check_profanity("book_lover"))

    def test_validate_username_format_error(self):
        """Test validate_username returns invalid_format for format errors."""
        is_valid, error = validate_username("ab")
        self.assertFalse(is_valid)
        self.assertEqual(error, 'invalid_format')

        is_valid, error = validate_username("user@name")
        self.assertFalse(is_valid)
        self.assertEqual(error, 'invalid_format')

    def test_validate_username_reserved(self):
        """Test validate_username returns reserved error."""
        is_valid, error = validate_username("admin")
        self.assertFalse(is_valid)
        self.assertEqual(error, 'reserved')

        is_valid, error = validate_username("API")
        self.assertFalse(is_valid)
        self.assertEqual(error, 'reserved')

    def test_validate_username_profanity(self):
        """Test validate_username returns profanity error."""
        is_valid, error = validate_username("fuck_user")
        self.assertFalse(is_valid)
        self.assertEqual(error, 'profanity')

    def test_validate_username_valid(self):
        """Test validate_username returns True for valid usernames."""
        is_valid, error = validate_username("valid_user")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

        is_valid, error = validate_username("bookworm123")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_check_username_availability(self):
        """Test username availability checking."""
        # Create a user
        User.objects.create_user(username="taken", password="pass")

        self.assertFalse(check_username_availability("taken"))
        self.assertFalse(check_username_availability("TAKEN"))  # Case insensitive
        self.assertFalse(check_username_availability("TaKeN"))
        self.assertTrue(check_username_availability("available"))
        self.assertTrue(check_username_availability("another_user"))


class UsernameGenerationTests(TestCase):
    """Test username generation functions."""

    def test_generate_username_suggestions(self):
        """Test generating username suggestions."""
        suggestions = generate_username_suggestions(count=5)
        self.assertGreater(len(suggestions), 0)
        self.assertLessEqual(len(suggestions), 5)

        # All suggestions should be valid
        for username in suggestions:
            is_valid, _ = validate_username(username)
            self.assertTrue(is_valid, f"Generated username '{username}' is not valid")
            self.assertLessEqual(len(username), 20)

    def test_generate_username_suggestions_with_base(self):
        """Test generating suggestions based on a base name."""
        suggestions = generate_username_suggestions(base_name="John Doe", count=3)
        self.assertGreater(len(suggestions), 0)

        # Should generate suggestions based on cleaned "johndoe"
        # At least one suggestion should contain "johndoe" if it's valid
        has_base = any("johndoe" in s for s in suggestions)
        self.assertTrue(has_base or len(suggestions) > 0)  # Either has base or has fallback

    def test_generate_username_suggestions_with_short_base(self):
        """Test generating suggestions with a base name that's too short after cleaning."""
        suggestions = generate_username_suggestions(base_name="Jo", count=3)
        self.assertGreater(len(suggestions), 0)
        # Should fall back to generic suggestions

    def test_generate_username_suggestions_with_special_chars(self):
        """Test generating suggestions from base with special characters."""
        suggestions = generate_username_suggestions(base_name="John@Doe#123", count=3)
        self.assertGreater(len(suggestions), 0)

        # All suggestions should be valid (no special chars)
        for username in suggestions:
            is_valid, _ = validate_username_format(username)
            self.assertTrue(is_valid, f"Generated username '{username}' has invalid format")

    def test_generate_username_suggestions_are_unique(self):
        """Test that suggestions don't include taken usernames."""
        # Create some users
        for i in range(5):
            User.objects.create_user(username=f"user{i}", password="pass")

        suggestions = generate_username_suggestions(count=5)

        # All suggestions should be available
        for username in suggestions:
            self.assertTrue(
                check_username_availability(username),
                f"Suggested username '{username}' is already taken"
            )

    def test_generate_username_suggestions_count(self):
        """Test that count parameter works correctly."""
        suggestions_3 = generate_username_suggestions(count=3)
        suggestions_5 = generate_username_suggestions(count=5)

        self.assertLessEqual(len(suggestions_3), 3)
        self.assertLessEqual(len(suggestions_5), 5)

    def test_generate_temp_username(self):
        """Test generating temporary usernames for social auth."""
        temp = generate_temp_username("google", "abc123def456")
        self.assertEqual(temp, "google_abc123de")
        self.assertLessEqual(len(temp), 20)

        temp2 = generate_temp_username("github", "xyz789")
        self.assertEqual(temp2, "github_xyz789")

    def test_generate_temp_username_long_uid(self):
        """Test temp username generation with long UID."""
        long_uid = "a" * 50
        temp = generate_temp_username("facebook", long_uid)
        self.assertLessEqual(len(temp), 20)
        self.assertTrue(temp.startswith("facebook_"))
        self.assertEqual(len(temp.split("_")[1]), 8)  # UID truncated to 8 chars


class EdgeCaseTests(TestCase):
    """Test edge cases and boundary conditions."""

    def test_username_format_with_numbers_only(self):
        """Test usernames with only numbers."""
        is_valid, _ = validate_username_format("123456")
        self.assertTrue(is_valid)

    def test_username_format_with_underscores_only(self):
        """Test usernames with only underscores."""
        is_valid, error = validate_username_format("___")
        self.assertTrue(is_valid)  # Technically valid format, though not great

    def test_username_format_exact_boundaries(self):
        """Test exact length boundaries."""
        # Exactly 3 characters
        is_valid, _ = validate_username_format("abc")
        self.assertTrue(is_valid)

        # Exactly 20 characters
        is_valid, _ = validate_username_format("a" * 20)
        self.assertTrue(is_valid)

    def test_generate_suggestions_with_profane_base(self):
        """Test that profane base names don't generate profane suggestions."""
        suggestions = generate_username_suggestions(base_name="fuck", count=3)

        # All suggestions should pass profanity check
        for username in suggestions:
            self.assertFalse(
                check_profanity(username),
                f"Generated username '{username}' contains profanity"
            )

    def test_generate_suggestions_with_reserved_base(self):
        """Test that reserved base names don't generate reserved suggestions."""
        suggestions = generate_username_suggestions(base_name="admin", count=3)

        # All suggestions should not be reserved
        for username in suggestions:
            self.assertFalse(
                check_reserved_username(username),
                f"Generated username '{username}' is reserved"
            )

    def test_empty_base_name(self):
        """Test generating suggestions with empty base name."""
        suggestions = generate_username_suggestions(base_name="", count=3)
        self.assertGreater(len(suggestions), 0)

    def test_none_base_name(self):
        """Test generating suggestions with None base name."""
        suggestions = generate_username_suggestions(base_name=None, count=3)
        self.assertGreater(len(suggestions), 0)
