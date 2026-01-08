"""Tests for social authentication integration."""
from django.test import TestCase
from unittest.mock import Mock
from allauth.socialaccount.signals import pre_social_login
from users.models import User


class SocialAuthIntegrationTests(TestCase):
    """Test cases for social authentication integration."""

    def test_temp_username_generated_on_social_signup(self):
        """Test that new social auth users get temporary usernames."""
        # Create a mock sociallogin object
        user = User(email='test@example.com')

        mock_account = Mock()
        mock_account.provider = 'google'
        mock_account.uid = 'abc123def456'

        mock_sociallogin = Mock()
        mock_sociallogin.is_existing = False
        mock_sociallogin.user = user
        mock_sociallogin.account = mock_account

        # Trigger the signal
        pre_social_login.send(
            sender=None,
            request=None,
            sociallogin=mock_sociallogin
        )

        # Verify temporary username was set
        self.assertTrue(user.username.startswith('google_'))
        self.assertEqual(len(user.username), 15)  # google_ + 8 hex chars
        self.assertFalse(user.onboarding_completed)
        self.assertEqual(user.onboarding_step, 1)

    def test_existing_user_username_unchanged(self):
        """Test that existing users keep their username."""
        # Create existing user
        existing_user = User.objects.create_user(
            username='realusername',
            email='test@example.com',
            password='password'
        )

        mock_account = Mock()
        mock_account.provider = 'google'
        mock_account.uid = 'xyz789'

        mock_sociallogin = Mock()
        mock_sociallogin.is_existing = True  # Existing user
        mock_sociallogin.user = existing_user
        mock_sociallogin.account = mock_account

        # Trigger the signal
        pre_social_login.send(
            sender=None,
            request=None,
            sociallogin=mock_sociallogin
        )

        # Verify username was NOT changed
        self.assertEqual(existing_user.username, 'realusername')

    def test_facebook_temp_username(self):
        """Test Facebook temp username format."""
        user = User(email='test@facebook.com')

        mock_account = Mock()
        mock_account.provider = 'facebook'
        mock_account.uid = '1234567890'

        mock_sociallogin = Mock()
        mock_sociallogin.is_existing = False
        mock_sociallogin.user = user
        mock_sociallogin.account = mock_account

        pre_social_login.send(
            sender=None,
            request=None,
            sociallogin=mock_sociallogin
        )

        self.assertTrue(user.username.startswith('facebook_'))
        self.assertEqual(len(user.username), 17)  # facebook_ + 8 hex chars

    def test_temp_username_uniqueness(self):
        """Test that temp usernames are unique when collisions occur."""
        from users.username_service import generate_temp_username

        # First, generate the expected temp username for this UID
        expected_base = generate_temp_username('google', 'abc123def456')

        # Create first user with that temp username
        User.objects.create_user(
            username=expected_base,
            email='existing@example.com',
            password='password'
        )

        # Try to create another user with the same UID (should get unique username)
        user = User(email='test@example.com')

        mock_account = Mock()
        mock_account.provider = 'google'
        mock_account.uid = 'abc123def456'  # Same UID as first test

        mock_sociallogin = Mock()
        mock_sociallogin.is_existing = False
        mock_sociallogin.user = user
        mock_sociallogin.account = mock_account

        pre_social_login.send(
            sender=None,
            request=None,
            sociallogin=mock_sociallogin
        )

        # Should have a different username due to collision
        self.assertNotEqual(user.username, expected_base)
        self.assertTrue(user.username.startswith(expected_base))

    def test_onboarding_started_at_set(self):
        """Test that onboarding_started_at is set for new social users."""
        user = User(email='test@example.com')

        mock_account = Mock()
        mock_account.provider = 'google'
        mock_account.uid = 'newuser123'

        mock_sociallogin = Mock()
        mock_sociallogin.is_existing = False
        mock_sociallogin.user = user
        mock_sociallogin.account = mock_account

        pre_social_login.send(
            sender=None,
            request=None,
            sociallogin=mock_sociallogin
        )

        # Verify onboarding_started_at was set
        self.assertIsNotNone(user.onboarding_started_at)
        self.assertFalse(user.onboarding_completed)
        self.assertEqual(user.onboarding_step, 1)

    def test_multiple_providers(self):
        """Test temp username generation for different providers."""
        providers_and_uids = [
            ('google', 'test123'),
            ('facebook', 'test456'),
            ('github', 'test789'),
        ]

        for provider, uid in providers_and_uids:
            with self.subTest(provider=provider):
                user = User(email=f'test@{provider}.com')

                mock_account = Mock()
                mock_account.provider = provider
                mock_account.uid = uid

                mock_sociallogin = Mock()
                mock_sociallogin.is_existing = False
                mock_sociallogin.user = user
                mock_sociallogin.account = mock_account

                pre_social_login.send(
                    sender=None,
                    request=None,
                    sociallogin=mock_sociallogin
                )

                # Verify username format
                self.assertTrue(user.username.startswith(f'{provider}_'))
                # Provider name + underscore + 8 hex chars
                self.assertEqual(len(user.username), len(provider) + 1 + 8)
                self.assertFalse(user.onboarding_completed)
                self.assertEqual(user.onboarding_step, 1)
