"""Tests for users app."""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, UserRole


class UserModelTestCase(TestCase):
    """Test cases for User model."""

    def test_create_user(self):
        """Test creating a regular user."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.role, UserRole.USER)
        self.assertEqual(user.reputation_points, 0)
        self.assertEqual(user.spoiler_preference, 'NONE')

    def test_user_default_role(self):
        """Test that default role is USER."""
        user = User.objects.create_user(username='user1', password='pass')
        self.assertEqual(user.role, UserRole.USER)

    def test_user_default_reputation(self):
        """Test that default reputation is 0."""
        user = User.objects.create_user(username='user1', password='pass')
        self.assertEqual(user.reputation_points, 0)

    def test_user_default_spoiler_preference(self):
        """Test that default spoiler preference is NONE."""
        user = User.objects.create_user(username='user1', password='pass')
        self.assertEqual(user.spoiler_preference, 'NONE')

    def test_user_str_representation(self):
        """Test string representation of User."""
        user = User.objects.create_user(username='testuser', password='pass')
        self.assertEqual(str(user), 'testuser')

    def test_create_moderator(self):
        """Test creating a moderator."""
        user = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
        )
        self.assertEqual(user.role, UserRole.MOD)

    def test_create_admin(self):
        """Test creating an admin."""
        user = User.objects.create_user(
            username='admin',
            password='pass',
            role=UserRole.ADMIN
        )
        self.assertEqual(user.role, UserRole.ADMIN)

    def test_user_roles(self):
        """Test all user roles."""
        user1 = User.objects.create_user(username='user1', password='pass', role=UserRole.USER)
        user2 = User.objects.create_user(username='user2', password='pass', role=UserRole.TRUSTED_EDITOR)
        user3 = User.objects.create_user(username='user3', password='pass', role=UserRole.MOD)
        user4 = User.objects.create_user(username='user4', password='pass', role=UserRole.ADMIN)

        self.assertEqual(user1.role, UserRole.USER)
        self.assertEqual(user2.role, UserRole.TRUSTED_EDITOR)
        self.assertEqual(user3.role, UserRole.MOD)
        self.assertEqual(user4.role, UserRole.ADMIN)

    def test_username_unique(self):
        """Test that username must be unique."""
        User.objects.create_user(username='testuser', password='pass')

        with self.assertRaises(Exception):
            User.objects.create_user(username='testuser', password='pass')


class AuthenticationAPITestCase(APITestCase):
    """Test cases for authentication API."""

    def test_signup(self):
        """Test user signup."""
        response = self.client.post('/api/users/signup/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

        # Verify user was created
        user = User.objects.get(username='newuser')
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertEqual(user.role, UserRole.USER)

    def test_signup_duplicate_username(self):
        """Test signup with duplicate username."""
        User.objects.create_user(username='existing', password='pass')

        response = self.client.post('/api/users/signup/', {
            'username': 'existing',
            'email': 'new@example.com',
            'password': 'pass123',
            'password_confirm': 'pass123'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login(self):
        """Test user login."""
        User.objects.create_user(username='testuser', password='testpass123')

        response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        User.objects.create_user(username='testuser', password='correctpass')

        response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        """Test login with nonexistent user."""
        response = self.client.post('/api/users/login/', {
            'username': 'nonexistent',
            'password': 'somepass'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_requires_authentication(self):
        """Test that logout requires authentication."""
        response = self.client.post('/api/users/logout/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout(self):
        """Test user logout."""
        user = User.objects.create_user(username='testuser', password='pass')
        self.client.force_authenticate(user=user)

        # Login to get refresh token
        login_response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'pass'
        })
        refresh_token = login_response.data['refresh']

        # Logout
        response = self.client.post('/api/users/logout/', {
            'refresh': refresh_token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_current_user_requires_authentication(self):
        """Test that getting current user requires authentication."""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user(self):
        """Test getting current user information."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='pass',
            role=UserRole.TRUSTED_EDITOR,
            reputation_points=100
        )
        self.client.force_authenticate(user=user)

        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['role'], UserRole.TRUSTED_EDITOR)
        self.assertEqual(response.data['reputation_points'], 100)


class UserAPITestCase(APITestCase):
    """Test cases for User API."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(
            username='alice',
            email='alice@example.com',
            password='pass'
        )
        self.user2 = User.objects.create_user(
            username='bob',
            email='bob@example.com',
            password='pass'
        )

    def test_list_users(self):
        """Test listing users."""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_get_user_profile(self):
        """Test getting a user profile."""
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'alice')
        self.assertIn('reputation_points', response.data)

    def test_get_user_profile_not_found(self):
        """Test getting a profile that doesn't exist."""
        response = self.client.get('/api/users/nonexistent/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_user_diffs(self):
        """Test getting diffs created by a user."""
        from diffs.models import DiffItem, DiffCategory, DiffStatus
        from works.models import Work
        from screen.models import ScreenWork, ScreenWorkType

        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

        # Create diffs
        DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.PLOT,
            claim="Diff 1",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )
        DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.CHARACTER,
            claim="Diff 2",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )

        response = self.client.get(f'/api/users/{self.user1.username}/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_get_user_diffs_only_shows_live(self):
        """Test that user diffs only shows LIVE diffs."""
        from diffs.models import DiffItem, DiffCategory, DiffStatus
        from works.models import Work
        from screen.models import ScreenWork, ScreenWorkType

        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

        DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.PLOT,
            claim="Live",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )
        DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.PLOT,
            claim="Pending",
            status=DiffStatus.PENDING,
            created_by=self.user1
        )

        response = self.client.get(f'/api/users/{self.user1.username}/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_get_user_comments(self):
        """Test getting comments posted by a user."""
        from diffs.models import DiffItem, DiffComment, DiffCategory, DiffStatus, CommentStatus
        from works.models import Work
        from screen.models import ScreenWork, ScreenWorkType

        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )
        diff = DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.PLOT,
            claim="Test",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )

        DiffComment.objects.create(
            diff_item=diff,
            user=self.user1,
            body="Comment 1",
            status=CommentStatus.LIVE
        )
        DiffComment.objects.create(
            diff_item=diff,
            user=self.user1,
            body="Comment 2",
            status=CommentStatus.LIVE
        )

        response = self.client.get(f'/api/users/{self.user1.username}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_get_user_comments_only_shows_live(self):
        """Test that user comments only shows LIVE comments."""
        from diffs.models import DiffItem, DiffComment, DiffCategory, DiffStatus, CommentStatus
        from works.models import Work
        from screen.models import ScreenWork, ScreenWorkType

        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )
        diff = DiffItem.objects.create(
            work=work,
            screen_work=screen,
            category=DiffCategory.PLOT,
            claim="Test",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )

        DiffComment.objects.create(
            diff_item=diff,
            user=self.user1,
            body="Live",
            status=CommentStatus.LIVE
        )
        DiffComment.objects.create(
            diff_item=diff,
            user=self.user1,
            body="Hidden",
            status=CommentStatus.HIDDEN
        )

        response = self.client.get(f'/api/users/{self.user1.username}/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_user_diffs_pagination(self):
        """Test pagination of user diffs."""
        from diffs.models import DiffItem, DiffCategory, DiffStatus
        from works.models import Work
        from screen.models import ScreenWork, ScreenWorkType

        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

        # Create 25 diffs
        for i in range(25):
            DiffItem.objects.create(
                work=work,
                screen_work=screen,
                category=DiffCategory.PLOT,
                claim=f"Diff {i}",
                status=DiffStatus.LIVE,
                created_by=self.user1
            )

        response = self.client.get(f'/api/users/{self.user1.username}/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 20)  # Default page size
        self.assertIn('next', response.data)
