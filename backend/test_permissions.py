"""Comprehensive permission tests for all API endpoints."""
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from users.models import UserRole
from works.models import Work
from screen.models import ScreenWork, ScreenWorkType
from diffs.models import DiffItem, DiffComment, DiffCategory, DiffStatus, SpoilerScope

User = get_user_model()


class WorksPermissionTestCase(APITestCase):
    """Test permissions for Works API."""

    def setUp(self):
        """Set up test data."""
        self.work = Work.objects.create(title="Test Book", slug="test-book")

    def test_list_works_public(self):
        """Test that anyone can list works."""
        response = self.client.get('/api/works/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_work_detail_public(self):
        """Test that anyone can get work detail."""
        response = self.client.get(f'/api/works/{self.work.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class ScreenWorksPermissionTestCase(APITestCase):
    """Test permissions for ScreenWorks API."""

    def setUp(self):
        """Set up test data."""
        self.screen_work = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Test Movie",
            slug="test-movie"
        )

    def test_list_screen_works_public(self):
        """Test that anyone can list screen works."""
        response = self.client.get('/api/screen/works/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_screen_work_detail_public(self):
        """Test that anyone can get screen work detail."""
        response = self.client.get(f'/api/screen/works/{self.screen_work.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class DiffsPermissionTestCase(APITestCase):
    """Test permissions for Diffs API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='user', password='pass')
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )
        self.diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Test diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

    def test_list_diffs_public(self):
        """Test that anyone can list diffs."""
        response = self.client.get('/api/diffs/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_diff_detail_public(self):
        """Test that anyone can get diff detail."""
        response = self.client.get(f'/api/diffs/items/{self.diff.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_diff_requires_authentication(self):
        """Test that creating a diff requires authentication."""
        response = self.client.post('/api/diffs/items/', {
            'work': self.work.id,
            'screen_work': self.screen.id,
            'category': DiffCategory.PLOT,
            'claim': 'New diff',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_diff_authenticated(self):
        """Test that authenticated users can create diffs."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/diffs/items/', {
            'work': self.work.id,
            'screen_work': self.screen.id,
            'category': DiffCategory.PLOT,
            'claim': 'New difference to test creation',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_vote_requires_authentication(self):
        """Test that voting requires authentication."""
        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': 'ACCURATE'}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_vote_authenticated(self):
        """Test that authenticated users can vote."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': 'ACCURATE'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CommentsPermissionTestCase(APITestCase):
    """Test permissions for Comments API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='user', password='pass')
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )
        self.diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Test diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

    def test_list_comments_public(self):
        """Test that anyone can list comments."""
        response = self.client.get('/api/diffs/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_comment_requires_authentication(self):
        """Test that creating a comment requires authentication."""
        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'New comment',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_comment_authenticated(self):
        """Test that authenticated users can create comments."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'New comment',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ModerationPermissionTestCase(APITestCase):
    """Test permissions for Moderation API."""

    def setUp(self):
        """Set up test data."""
        self.regular_user = User.objects.create_user(
            username='regular',
            password='pass',
            role=UserRole.USER
        )
        self.trusted_editor = User.objects.create_user(
            username='trusted',
            password='pass',
            role=UserRole.TRUSTED_EDITOR
        )
        self.moderator = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
        )
        self.admin = User.objects.create_user(
            username='admin',
            password='pass',
            role=UserRole.ADMIN
        )
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )
        self.diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Test",
            status=DiffStatus.PENDING,
            created_by=self.regular_user
        )

    def test_moderation_requires_authentication(self):
        """Test that moderation endpoints require authentication."""
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_cannot_access_moderation(self):
        """Test that regular users cannot access moderation."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_trusted_editor_cannot_access_moderation(self):
        """Test that trusted editors cannot access moderation."""
        self.client.force_authenticate(user=self.trusted_editor)
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_access_moderation(self):
        """Test that moderators can access moderation."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_access_moderation(self):
        """Test that admins can access moderation."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_user_cannot_approve_diff(self):
        """Test that regular users cannot approve diffs."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(f'/api/mod/diffs/{self.diff.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_approve_diff(self):
        """Test that moderators can approve diffs."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/diffs/{self.diff.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_approve_diff(self):
        """Test that admins can approve diffs."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/mod/diffs/{self.diff.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_regular_user_cannot_reject_diff(self):
        """Test that regular users cannot reject diffs."""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.post(
            f'/api/mod/diffs/{self.diff.id}/reject/',
            {'reason': 'Test'}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_reject_diff(self):
        """Test that moderators can reject diffs."""
        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/mod/diffs/{self.diff.id}/reject/',
            {'reason': 'Test'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class UserAPIPermissionTestCase(APITestCase):
    """Test permissions for User API."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')

    def test_list_users_public(self):
        """Test that anyone can list users."""
        response = self.client.get('/api/users/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_user_profile_public(self):
        """Test that anyone can get user profiles."""
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_current_user_requires_authentication(self):
        """Test that getting current user requires authentication."""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_current_user_authenticated(self):
        """Test that authenticated users can get their own info."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'user1')


class AuthenticationEndpointsPermissionTestCase(APITestCase):
    """Test permissions for authentication endpoints."""

    def test_signup_public(self):
        """Test that anyone can signup."""
        response = self.client.post('/api/users/signup/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_login_public(self):
        """Test that anyone can login."""
        User.objects.create_user(username='testuser', password='testpass')
        response = self.client.post('/api/users/login/', {
            'username': 'testuser',
            'password': 'testpass'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_requires_authentication(self):
        """Test that logout requires authentication."""
        response = self.client.post('/api/users/logout/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RoleBasedAccessTestCase(APITestCase):
    """Test role-based access control across all roles."""

    def setUp(self):
        """Set up test data with all user roles."""
        self.regular_user = User.objects.create_user(
            username='regular',
            password='pass',
            role=UserRole.USER
        )
        self.trusted_editor = User.objects.create_user(
            username='trusted',
            password='pass',
            role=UserRole.TRUSTED_EDITOR
        )
        self.moderator = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
        )
        self.admin = User.objects.create_user(
            username='admin',
            password='pass',
            role=UserRole.ADMIN
        )

    def test_all_roles_can_view_public_content(self):
        """Test that all roles can view public content."""
        work = Work.objects.create(title="Book", slug="book")

        for user in [self.regular_user, self.trusted_editor, self.moderator, self.admin]:
            self.client.force_authenticate(user=user)
            response = self.client.get('/api/works/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_all_authenticated_users_can_create_diffs(self):
        """Test that all authenticated users can create diffs."""
        work = Work.objects.create(title="Book", slug="book")
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

        for user in [self.regular_user, self.trusted_editor, self.moderator, self.admin]:
            self.client.force_authenticate(user=user)
            response = self.client.post('/api/diffs/items/', {
                'work': work.id,
                'screen_work': screen.id,
                'category': DiffCategory.PLOT,
                'claim': f'Diff by {user.username}',
                'spoiler_scope': SpoilerScope.NONE
            })
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_only_moderators_and_admins_can_access_moderation(self):
        """Test that only MOD and ADMIN roles can access moderation."""
        # Regular user and trusted editor cannot access
        for user in [self.regular_user, self.trusted_editor]:
            self.client.force_authenticate(user=user)
            response = self.client.get('/api/mod/diffs/')
            self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Moderator and admin can access
        for user in [self.moderator, self.admin]:
            self.client.force_authenticate(user=user)
            response = self.client.get('/api/mod/diffs/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)


class CrossUserPermissionTestCase(APITestCase):
    """Test permissions for cross-user operations."""

    def setUp(self):
        """Set up test data."""
        self.user1 = User.objects.create_user(username='user1', password='pass')
        self.user2 = User.objects.create_user(username='user2', password='pass')
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

    def test_users_can_view_others_diffs(self):
        """Test that users can view diffs created by others."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="User1's diff",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )

        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/diffs/items/{diff.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_users_can_view_others_profiles(self):
        """Test that users can view other users' profiles."""
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/users/{self.user1.username}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_users_can_view_others_activity(self):
        """Test that users can view other users' activity."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="User1's diff",
            status=DiffStatus.LIVE,
            created_by=self.user1
        )

        self.client.force_authenticate(user=self.user2)
        response = self.client.get(f'/api/users/{self.user1.username}/diffs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
