"""Tests for onboarding API endpoints."""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from users.models import UserPreferences

User = get_user_model()


class OnboardingAPITests(TestCase):
    """Test suite for onboarding API endpoints."""

    def setUp(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_check_username_available(self):
        """Test checking available username."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'newuser'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])
        self.assertIn('suggestions', response.data)

    def test_check_username_taken(self):
        """Test checking taken username."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'testuser'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])
        self.assertIn('suggestions', response.data)
        self.assertGreater(len(response.data['suggestions']), 0)

    def test_check_username_reserved(self):
        """Test checking reserved username."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'admin'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])
        self.assertEqual(response.data['error'], 'reserved')
        self.assertIn('message', response.data)

    def test_check_username_too_short(self):
        """Test checking username that's too short."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'ab'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])
        self.assertEqual(response.data['error'], 'invalid_format')

    def test_check_username_invalid_characters(self):
        """Test checking username with invalid characters."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'user@name'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['available'])
        self.assertEqual(response.data['error'], 'invalid_format')

    def test_check_username_empty(self):
        """Test checking empty username."""
        response = self.client.post('/api/users/me/username/check/', {
            'username': ''
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_check_username_requires_auth(self):
        """Test that username check requires authentication."""
        self.client.logout()
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'newuser'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_set_username_success(self):
        """Test setting username successfully."""
        response = self.client.post('/api/users/me/username/', {
            'username': 'newusername'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('user', response.data)

        # Verify username was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newusername')
        self.assertEqual(self.user.onboarding_step, 2)
        self.assertIsNotNone(self.user.onboarding_started_at)

    def test_set_username_updates_onboarding_step(self):
        """Test that setting username updates onboarding step."""
        self.user.onboarding_step = 0
        self.user.save()

        response = self.client.post('/api/users/me/username/', {
            'username': 'newusername'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 2)

    def test_set_username_preserves_higher_step(self):
        """Test that setting username doesn't decrease onboarding step."""
        self.user.onboarding_step = 3
        self.user.save()

        response = self.client.post('/api/users/me/username/', {
            'username': 'newusername'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 3)

    def test_set_username_invalid(self):
        """Test setting invalid username."""
        response = self.client.post('/api/users/me/username/', {
            'username': 'ab'  # Too short
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_set_username_taken(self):
        """Test setting already taken username."""
        User.objects.create_user(username='taken', email='taken@example.com', password='pass')

        response = self.client.post('/api/users/me/username/', {
            'username': 'taken'
        })
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('error', response.data)

    def test_set_username_reserved(self):
        """Test setting reserved username."""
        response = self.client.post('/api/users/me/username/', {
            'username': 'admin'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_username_empty(self):
        """Test setting empty username."""
        response = self.client.post('/api/users/me/username/', {
            'username': ''
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_username_requires_auth(self):
        """Test that setting username requires authentication."""
        self.client.logout()
        response = self.client.post('/api/users/me/username/', {
            'username': 'newuser'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_set_preferences_create(self):
        """Test creating preferences."""
        response = self.client.post('/api/users/me/preferences/', {
            'genres': ['Fantasy', 'Sci-Fi'],
            'book_vs_screen': 'EQUAL',
            'contribution_interest': 'ADD_DIFFS'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('preferences', response.data)

        # Verify preferences were created
        self.assertTrue(UserPreferences.objects.filter(user=self.user).exists())
        prefs = self.user.preferences
        self.assertEqual(prefs.genres, ['Fantasy', 'Sci-Fi'])
        self.assertEqual(prefs.book_vs_screen, 'EQUAL')
        self.assertEqual(prefs.contribution_interest, 'ADD_DIFFS')

        # Verify onboarding step was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 3)

    def test_set_preferences_update(self):
        """Test updating existing preferences."""
        # Create initial preferences
        UserPreferences.objects.create(
            user=self.user,
            genres=['Romance'],
            book_vs_screen='BOOKS',
            contribution_interest='EXPLORE'
        )

        # Update preferences
        response = self.client.post('/api/users/me/preferences/', {
            'genres': ['Fantasy', 'Mystery'],
            'contribution_interest': 'DISCUSS'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

        # Verify preferences were updated
        self.user.refresh_from_db()
        prefs = self.user.preferences
        self.assertEqual(prefs.genres, ['Fantasy', 'Mystery'])
        self.assertEqual(prefs.contribution_interest, 'DISCUSS')
        # book_vs_screen should remain unchanged
        self.assertEqual(prefs.book_vs_screen, 'BOOKS')

    def test_set_preferences_partial_update(self):
        """Test partial update of preferences."""
        UserPreferences.objects.create(
            user=self.user,
            genres=['Fantasy'],
            book_vs_screen='EQUAL',
            contribution_interest='EXPLORE'
        )

        # Only update genres
        response = self.client.post('/api/users/me/preferences/', {
            'genres': ['Horror', 'Thriller']
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Refresh from database
        self.user.refresh_from_db()
        prefs = UserPreferences.objects.get(user=self.user)
        self.assertEqual(prefs.genres, ['Horror', 'Thriller'])
        self.assertEqual(prefs.book_vs_screen, 'EQUAL')
        self.assertEqual(prefs.contribution_interest, 'EXPLORE')

    def test_set_preferences_invalid_choice(self):
        """Test setting preferences with invalid choice."""
        response = self.client.post('/api/users/me/preferences/', {
            'book_vs_screen': 'INVALID_CHOICE',
            'contribution_interest': 'ADD_DIFFS'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_preferences_requires_auth(self):
        """Test that setting preferences requires authentication."""
        self.client.logout()
        response = self.client.post('/api/users/me/preferences/', {
            'genres': ['Fantasy']
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user_with_onboarding(self):
        """Test getting current user includes onboarding fields."""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('onboarding_completed', response.data)
        self.assertIn('onboarding_step', response.data)
        self.assertIn('onboarding_started_at', response.data)
        self.assertIn('preferences', response.data)

    def test_get_current_user_with_preferences(self):
        """Test getting current user includes preferences."""
        UserPreferences.objects.create(
            user=self.user,
            genres=['Fantasy', 'Sci-Fi'],
            book_vs_screen='EQUAL',
            contribution_interest='ADD_DIFFS'
        )

        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['preferences'])
        self.assertEqual(response.data['preferences']['genres'], ['Fantasy', 'Sci-Fi'])

    def test_get_current_user_without_preferences(self):
        """Test getting current user without preferences."""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['preferences'])

    def test_update_onboarding_progress(self):
        """Test updating onboarding progress."""
        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 3,
            'onboarding_completed': False
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['onboarding_step'], 3)
        self.assertFalse(response.data['onboarding_completed'])

        # Verify state was updated
        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 3)
        self.assertFalse(self.user.onboarding_completed)
        self.assertIsNotNone(self.user.onboarding_started_at)

    def test_update_onboarding_complete(self):
        """Test marking onboarding as complete."""
        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 4,
            'onboarding_completed': True
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['onboarding_completed'])

        # Verify completion timestamp was set
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_completed)
        self.assertIsNotNone(self.user.onboarding_completed_at)

    def test_update_onboarding_sets_started_at(self):
        """Test that updating onboarding sets started_at if not set."""
        self.user.onboarding_started_at = None
        self.user.save()

        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 2
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.onboarding_started_at)

    def test_update_onboarding_partial(self):
        """Test partial update of onboarding state."""
        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 2
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 2)
        self.assertFalse(self.user.onboarding_completed)

    def test_update_onboarding_requires_auth(self):
        """Test that updating onboarding requires authentication."""
        self.client.logout()
        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 2
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_suggested_comparisons_requires_auth(self):
        """Test that suggested comparisons requires authentication."""
        self.client.logout()
        response = self.client.get('/api/users/me/suggested-comparisons/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_suggested_comparisons_without_preferences(self):
        """Test suggested comparisons without preferences."""
        response = self.client.get('/api/users/me/suggested-comparisons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('comparisons', response.data)
        self.assertIn('intent', response.data)
        self.assertEqual(response.data['intent'], 'EXPLORE')

    def test_suggested_comparisons_with_preferences(self):
        """Test suggested comparisons with preferences."""
        UserPreferences.objects.create(
            user=self.user,
            genres=['Fantasy'],
            contribution_interest='ADD_DIFFS'
        )

        response = self.client.get('/api/users/me/suggested-comparisons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['intent'], 'ADD_DIFFS')


class OnboardingFlowIntegrationTests(TestCase):
    """Integration tests for complete onboarding flow."""

    def setUp(self):
        """Set up test client and user."""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='tempuser',
            email='temp@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)

    def test_complete_onboarding_flow(self):
        """Test complete onboarding flow from start to finish."""
        # Step 1: Check username availability
        response = self.client.post('/api/users/me/username/check/', {
            'username': 'mynewusername'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['available'])

        # Step 2: Set username
        response = self.client.post('/api/users/me/username/', {
            'username': 'mynewusername'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'mynewusername')
        self.assertEqual(self.user.onboarding_step, 2)

        # Step 3: Set preferences
        response = self.client.post('/api/users/me/preferences/', {
            'genres': ['Fantasy', 'Sci-Fi'],
            'book_vs_screen': 'EQUAL',
            'contribution_interest': 'DISCUSS'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.onboarding_step, 3)

        # Step 4: Get suggested comparisons
        response = self.client.get('/api/users/me/suggested-comparisons/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['intent'], 'DISCUSS')

        # Step 5: Complete onboarding
        response = self.client.patch('/api/users/me/onboarding/', {
            'onboarding_step': 4,
            'onboarding_completed': True
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.onboarding_completed)
        self.assertIsNotNone(self.user.onboarding_completed_at)

        # Verify final user state
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['onboarding_completed'])
        self.assertEqual(response.data['onboarding_step'], 4)
        self.assertIsNotNone(response.data['preferences'])
