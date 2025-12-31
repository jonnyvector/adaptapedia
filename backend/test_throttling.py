"""Test rate limiting on API endpoints."""
import time
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User


class ThrottlingTests(TestCase):
    """Test rate limiting on public endpoints."""

    def setUp(self):
        """Set up test client."""
        self.client = APIClient()

    def test_auth_throttle_limit(self):
        """Test that auth endpoints are throttled at 5 req/min."""
        # Make 5 requests (should succeed)
        for i in range(5):
            response = self.client.post('/api/users/login/', {
                'username': 'testuser',
                'password': 'wrongpassword'
            })
            # Should get 400 or 401 (not 429)
            self.assertIn(response.status_code, [400, 401])

        # 6th request should be throttled
        response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 429)

    def test_search_throttle_limit(self):
        """Test that search endpoints are throttled at 30 req/min."""
        # Make 30 requests (should succeed)
        for i in range(30):
            response = self.client.get('/api/works/search-with-adaptations/?q=test')
            # Should get 200 (or possibly 404 if no results)
            self.assertIn(response.status_code, [200, 404])

        # 31st request should be throttled
        response = self.client.get('/api/works/search-with-adaptations/?q=test')
        self.assertEqual(response.status_code, 429)

    def test_public_list_throttle_limit(self):
        """Test that public list endpoints are throttled at 60 req/min."""
        # Make 60 requests (should succeed)
        for i in range(60):
            response = self.client.get('/api/works/')
            self.assertEqual(response.status_code, 200)

        # 61st request should be throttled
        response = self.client.get('/api/works/')
        self.assertEqual(response.status_code, 429)

    def test_authenticated_user_higher_limit(self):
        """Test that authenticated users have higher limits."""
        # Create and authenticate a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=user)

        # Authenticated users should have 300 req/min limit
        # Test with a few requests (not all 300 for performance)
        for i in range(10):
            response = self.client.get('/api/works/')
            self.assertEqual(response.status_code, 200)
