"""Tests for users app."""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, UserRole, Bookmark
from works.models import Work
from screen.models import ScreenWork, AdaptationEdge


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


class BookmarkModelTestCase(TestCase):
    """Test cases for Bookmark model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.work = Work.objects.create(title='Test Book', slug='test-book')
        self.screen_work = ScreenWork.objects.create(
            type='MOVIE',
            title='Test Movie',
            slug='test-movie'
        )
        # Create adaptation edge
        AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            relation_type='BASED_ON',
            source='MANUAL',
            confidence=1.0
        )

    def test_create_bookmark(self):
        """Test creating a bookmark."""
        bookmark = Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )
        self.assertEqual(bookmark.user, self.user)
        self.assertEqual(bookmark.work, self.work)
        self.assertEqual(bookmark.screen_work, self.screen_work)
        self.assertIsNotNone(bookmark.created_at)

    def test_bookmark_unique_constraint(self):
        """Test that a user can only bookmark a comparison once."""
        Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Attempt to create duplicate bookmark
        with self.assertRaises(Exception):
            Bookmark.objects.create(
                user=self.user,
                work=self.work,
                screen_work=self.screen_work
            )

    def test_bookmark_str_representation(self):
        """Test string representation of Bookmark."""
        bookmark = Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )
        expected = f"{self.user.username} bookmarked {self.work.title} / {self.screen_work.title}"
        self.assertEqual(str(bookmark), expected)

    def test_bookmark_ordering(self):
        """Test that bookmarks are ordered by creation date (newest first)."""
        bookmark1 = Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Create another work/screen pair for second bookmark
        work2 = Work.objects.create(title='Book 2', slug='book-2')
        screen2 = ScreenWork.objects.create(type='TV', title='TV Show', slug='tv-show')
        AdaptationEdge.objects.create(
            work=work2,
            screen_work=screen2,
            relation_type='BASED_ON',
            source='MANUAL',
            confidence=1.0
        )

        bookmark2 = Bookmark.objects.create(
            user=self.user,
            work=work2,
            screen_work=screen2
        )

        bookmarks = list(Bookmark.objects.all())
        self.assertEqual(bookmarks[0], bookmark2)  # Newest first
        self.assertEqual(bookmarks[1], bookmark1)


class BookmarkAPITestCase(APITestCase):
    """Test cases for Bookmark API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.work = Work.objects.create(title='Test Book', slug='test-book')
        self.screen_work = ScreenWork.objects.create(
            type='MOVIE',
            title='Test Movie',
            slug='test-movie'
        )
        # Create adaptation edge
        self.adaptation = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            relation_type='BASED_ON',
            source='MANUAL',
            confidence=1.0
        )

    def test_create_bookmark_unauthenticated(self):
        """Test that unauthenticated users cannot create bookmarks."""
        response = self.client.post('/api/users/bookmarks/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_bookmark_authenticated(self):
        """Test creating a bookmark as authenticated user."""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/users/bookmarks/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['work'], self.work.id)
        self.assertEqual(response.data['screen_work'], self.screen_work.id)

        # Verify bookmark was created
        self.assertTrue(
            Bookmark.objects.filter(
                user=self.user,
                work=self.work,
                screen_work=self.screen_work
            ).exists()
        )

    def test_create_duplicate_bookmark(self):
        """Test that creating a duplicate bookmark returns an error."""
        self.client.force_authenticate(user=self.user)

        # Create first bookmark
        self.client.post('/api/users/bookmarks/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })

        # Attempt to create duplicate
        response = self.client.post('/api/users/bookmarks/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_bookmark_invalid_adaptation(self):
        """Test that creating a bookmark for non-existent adaptation fails."""
        self.client.force_authenticate(user=self.user)

        # Create work and screen work without adaptation edge
        work2 = Work.objects.create(title='Book 2', slug='book-2')
        screen2 = ScreenWork.objects.create(type='TV', title='TV Show', slug='tv-show')

        response = self.client.post('/api/users/bookmarks/', {
            'work': work2.id,
            'screen_work': screen2.id
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_bookmarks_unauthenticated(self):
        """Test that unauthenticated users cannot list bookmarks."""
        response = self.client.get('/api/users/bookmarks/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_bookmarks_authenticated(self):
        """Test listing bookmarks for authenticated user."""
        self.client.force_authenticate(user=self.user)

        # Create bookmarks
        Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        response = self.client.get('/api/users/bookmarks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(len(response.data['results']), 1)

    def test_list_bookmarks_only_shows_own(self):
        """Test that users only see their own bookmarks."""
        other_user = User.objects.create_user(username='other', password='pass')

        # Create bookmark for main user
        Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Create bookmark for other user
        work2 = Work.objects.create(title='Book 2', slug='book-2')
        screen2 = ScreenWork.objects.create(type='TV', title='TV Show', slug='tv-show')
        AdaptationEdge.objects.create(
            work=work2,
            screen_work=screen2,
            relation_type='BASED_ON',
            source='MANUAL',
            confidence=1.0
        )
        Bookmark.objects.create(
            user=other_user,
            work=work2,
            screen_work=screen2
        )

        # Authenticate as main user and list bookmarks
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/bookmarks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_delete_bookmark(self):
        """Test deleting a bookmark."""
        self.client.force_authenticate(user=self.user)

        # Create bookmark
        bookmark = Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Delete bookmark
        response = self.client.delete(f'/api/users/bookmarks/{bookmark.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deletion
        self.assertFalse(Bookmark.objects.filter(id=bookmark.id).exists())

    def test_delete_bookmark_by_comparison(self):
        """Test deleting a bookmark by work and screen_work IDs."""
        self.client.force_authenticate(user=self.user)

        # Create bookmark
        Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Delete by comparison
        response = self.client.delete(
            f'/api/users/bookmarks/delete-by-comparison/?work={self.work.id}&screen_work={self.screen_work.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify deletion
        self.assertFalse(
            Bookmark.objects.filter(
                user=self.user,
                work=self.work,
                screen_work=self.screen_work
            ).exists()
        )

    def test_check_bookmark_exists(self):
        """Test checking if a bookmark exists."""
        self.client.force_authenticate(user=self.user)

        # Create bookmark
        bookmark = Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # Check if bookmarked
        response = self.client.post('/api/users/bookmarks/check/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_bookmarked'])
        self.assertEqual(response.data['bookmark_id'], bookmark.id)

    def test_check_bookmark_not_exists(self):
        """Test checking if a bookmark doesn't exist."""
        self.client.force_authenticate(user=self.user)

        # Check if bookmarked (should not be)
        response = self.client.post('/api/users/bookmarks/check/', {
            'work': self.work.id,
            'screen_work': self.screen_work.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_bookmarked'])
        self.assertIsNone(response.data['bookmark_id'])

    def test_bookmark_serializer_includes_metadata(self):
        """Test that bookmark serializer includes work and screen work metadata."""
        self.client.force_authenticate(user=self.user)

        # Create bookmark
        Bookmark.objects.create(
            user=self.user,
            work=self.work,
            screen_work=self.screen_work
        )

        # List bookmarks
        response = self.client.get('/api/users/bookmarks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        bookmark_data = response.data['results'][0]
        self.assertEqual(bookmark_data['work_title'], self.work.title)
        self.assertEqual(bookmark_data['work_slug'], self.work.slug)
        self.assertEqual(bookmark_data['screen_work_title'], self.screen_work.title)
        self.assertEqual(bookmark_data['screen_work_slug'], self.screen_work.slug)
        self.assertEqual(bookmark_data['screen_work_type'], self.screen_work.type)


class SocialAuthIntegrationTests(TestCase):
    """Test cases for social authentication integration."""

    def test_temp_username_generated_on_social_signup(self):
        """Test that new social auth users get temporary usernames."""
        from allauth.socialaccount.signals import pre_social_login
        from unittest.mock import Mock

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
        self.assertEqual(user.username, 'google_e99a18c4')
        self.assertFalse(user.onboarding_completed)
        self.assertEqual(user.onboarding_step, 1)

    def test_existing_user_username_unchanged(self):
        """Test that existing users keep their username."""
        from allauth.socialaccount.signals import pre_social_login
        from unittest.mock import Mock

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
        from allauth.socialaccount.signals import pre_social_login
        from unittest.mock import Mock

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

        self.assertEqual(user.username, 'facebook_e807f1fc')

    def test_temp_username_uniqueness(self):
        """Test that temp usernames are unique when collisions occur."""
        from allauth.socialaccount.signals import pre_social_login
        from unittest.mock import Mock

        # Create first user with a specific temp username
        User.objects.create_user(
            username='google_e99a18c4',
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
        self.assertNotEqual(user.username, 'google_e99a18c4')
        self.assertTrue(user.username.startswith('google_e99a18c4'))

    def test_onboarding_started_at_set(self):
        """Test that onboarding_started_at is set for new social users."""
        from allauth.socialaccount.signals import pre_social_login
        from unittest.mock import Mock

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


class UsernameServiceTests(TestCase):
    """Test cases for username service functions."""

    def test_generate_temp_username(self):
        """Test temp username generation."""
        from users.username_service import generate_temp_username

        username = generate_temp_username('google', 'test123')
        self.assertTrue(username.startswith('google_'))
        self.assertEqual(len(username), 16)  # google_ + 8 hex chars

    def test_generate_temp_username_uniqueness(self):
        """Test that temp username generation handles collisions."""
        from users.username_service import generate_temp_username

        # Create a user with the expected temp username
        User.objects.create_user(
            username='google_098f6bcd',
            email='test@example.com',
            password='password'
        )

        # Generate a temp username with the same hash
        username = generate_temp_username('google', 'test')

        # Should get a modified username
        self.assertNotEqual(username, 'google_098f6bcd')
        self.assertTrue(username.startswith('google_098f6bcd'))

    def test_is_temp_username(self):
        """Test temp username detection."""
        from users.username_service import is_temp_username

        # Valid temp usernames
        self.assertTrue(is_temp_username('google_abc12345'))
        self.assertTrue(is_temp_username('facebook_12345678'))
        self.assertTrue(is_temp_username('github_abcdef01'))

        # Invalid temp usernames
        self.assertFalse(is_temp_username('regularusername'))
        self.assertFalse(is_temp_username('google_short'))
        self.assertFalse(is_temp_username('invalid_provider_abc12345'))

    def test_validate_username_length(self):
        """Test username validation - length checks."""
        from users.username_service import validate_username

        # Too short
        is_valid, error = validate_username('ab')
        self.assertFalse(is_valid)
        self.assertIn('at least 3', error)

        # Too long
        is_valid, error = validate_username('a' * 31)
        self.assertFalse(is_valid)
        self.assertIn('at most 30', error)

        # Valid length
        is_valid, error = validate_username('validuser')
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_validate_username_characters(self):
        """Test username validation - character checks."""
        from users.username_service import validate_username

        # Invalid characters
        is_valid, error = validate_username('user@name')
        self.assertFalse(is_valid)
        self.assertIn('can only contain', error)

        is_valid, error = validate_username('user name')
        self.assertFalse(is_valid)
        self.assertIn('can only contain', error)

        # Valid characters
        is_valid, error = validate_username('user_name-123')
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_validate_username_start_character(self):
        """Test username validation - must start with alphanumeric."""
        from users.username_service import validate_username

        # Invalid start
        is_valid, error = validate_username('_username')
        self.assertFalse(is_valid)
        self.assertIn('must start with', error)

        is_valid, error = validate_username('-username')
        self.assertFalse(is_valid)
        self.assertIn('must start with', error)

        # Valid start
        is_valid, error = validate_username('username_')
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_validate_username_temp_pattern_rejection(self):
        """Test username validation - reject temp patterns."""
        from users.username_service import validate_username

        # Temp patterns should be rejected
        is_valid, error = validate_username('google_abc12345')
        self.assertFalse(is_valid)
        self.assertIn('temporary format', error)

        is_valid, error = validate_username('facebook_12345678')
        self.assertFalse(is_valid)
        self.assertIn('temporary format', error)

    def test_validate_username_uniqueness(self):
        """Test username validation - uniqueness check."""
        from users.username_service import validate_username

        # Create existing user
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='password'
        )

        # Try to validate same username
        is_valid, error = validate_username('existinguser')
        self.assertFalse(is_valid)
        self.assertIn('already taken', error)

        # New username should be valid
        is_valid, error = validate_username('newuser')
        self.assertTrue(is_valid)
        self.assertIsNone(error)
