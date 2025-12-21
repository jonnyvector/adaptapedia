"""Tests for moderation app."""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Report
from diffs.models import DiffItem, DiffComment, DiffCategory, DiffStatus, CommentStatus, SpoilerScope
from works.models import Work
from screen.models import ScreenWork, ScreenWorkType
from users.models import UserRole

User = get_user_model()


class ReportModelTestCase(TestCase):
    """Test cases for Report model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='reporter', password='pass')
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
            created_by=self.user
        )

    def test_create_report(self):
        """Test creating a report."""
        report = Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            description='This is spam',
            created_by=self.user
        )
        self.assertEqual(report.target_type, 'DIFF')
        self.assertEqual(report.target_id, self.diff.id)
        self.assertEqual(report.reason, 'SPAM')
        self.assertEqual(report.created_by, self.user)
        self.assertEqual(report.status, 'PENDING')

    def test_report_str_representation(self):
        """Test string representation of Report."""
        report = Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=self.user
        )
        str_repr = str(report)
        self.assertIn('DIFF', str_repr)


class ModerationPermissionTestCase(APITestCase):
    """Test cases for moderation permissions."""

    def setUp(self):
        """Set up test data."""
        self.regular_user = User.objects.create_user(
            username='regular',
            password='pass',
            role=UserRole.USER
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

    def test_moderation_requires_authentication(self):
        """Test that moderation endpoints require authentication."""
        response = self.client.get('/api/mod/diffs/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_regular_user_cannot_access_moderation(self):
        """Test that regular users cannot access moderation."""
        self.client.force_authenticate(user=self.regular_user)

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


class DiffModerationAPITestCase(APITestCase):
    """Test cases for DiffItem moderation API."""

    def setUp(self):
        """Set up test data."""
        self.moderator = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
        )
        self.user = User.objects.create_user(username='user', password='pass')
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

    def test_list_pending_diffs(self):
        """Test listing pending diffs."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Pending diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Live diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/mod/diffs/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['status'], DiffStatus.PENDING)

    def test_list_flagged_diffs(self):
        """Test listing flagged diffs."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Flagged diff",
            status=DiffStatus.FLAGGED,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/mod/diffs/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_approve_diff(self):
        """Test approving a pending diff."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Pending diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/diffs/{diff.id}/approve/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], DiffStatus.LIVE)

        # Verify in database
        diff.refresh_from_db()
        self.assertEqual(diff.status, DiffStatus.LIVE)

    def test_reject_diff(self):
        """Test rejecting a pending diff."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Pending diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(
            f'/api/mod/diffs/{diff.id}/reject/',
            {'reason': 'Not accurate'}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], DiffStatus.REJECTED)

        # Verify in database
        diff.refresh_from_db()
        self.assertEqual(diff.status, DiffStatus.REJECTED)

    def test_flag_diff(self):
        """Test flagging a diff for review."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Live diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/diffs/{diff.id}/flag/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], DiffStatus.FLAGGED)

        # Verify in database
        diff.refresh_from_db()
        self.assertEqual(diff.status, DiffStatus.FLAGGED)

    def test_regular_user_cannot_approve(self):
        """Test that regular users cannot approve diffs."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Pending diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/mod/diffs/{diff.id}/approve/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_diffs_by_status(self):
        """Test filtering moderation diffs by status."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Pending",
            status=DiffStatus.PENDING,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Flagged",
            status=DiffStatus.FLAGGED,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(f'/api/mod/diffs/?status={DiffStatus.PENDING}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_diffs_by_category(self):
        """Test filtering moderation diffs by category."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Plot diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.CHARACTER,
            claim="Character diff",
            status=DiffStatus.PENDING,
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(f'/api/mod/diffs/?category={DiffCategory.PLOT}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class CommentModerationAPITestCase(APITestCase):
    """Test cases for DiffComment moderation API."""

    def setUp(self):
        """Set up test data."""
        self.moderator = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
        )
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
            claim="Test",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

    def test_list_comments_for_moderation(self):
        """Test listing comments for moderation."""
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Pending comment",
            status=CommentStatus.PENDING
        )
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Live comment",
            status=CommentStatus.LIVE
        )
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Deleted comment",
            status=CommentStatus.DELETED
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/mod/comments/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should show PENDING and LIVE, not DELETED
        self.assertEqual(response.data['count'], 2)

    def test_approve_comment(self):
        """Test approving a pending comment."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Pending comment",
            status=CommentStatus.PENDING
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/comments/{comment.id}/approve/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], CommentStatus.LIVE)

        # Verify in database
        comment.refresh_from_db()
        self.assertEqual(comment.status, CommentStatus.LIVE)

    def test_hide_comment(self):
        """Test hiding a comment."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Live comment",
            status=CommentStatus.LIVE
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/comments/{comment.id}/hide/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], CommentStatus.HIDDEN)

        # Verify in database
        comment.refresh_from_db()
        self.assertEqual(comment.status, CommentStatus.HIDDEN)

    def test_delete_comment(self):
        """Test deleting a comment."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Live comment",
            status=CommentStatus.LIVE
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/comments/{comment.id}/delete/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], CommentStatus.DELETED)

        # Verify in database
        comment.refresh_from_db()
        self.assertEqual(comment.status, CommentStatus.DELETED)

    def test_regular_user_cannot_moderate_comments(self):
        """Test that regular users cannot moderate comments."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test comment",
            status=CommentStatus.PENDING
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/mod/comments/{comment.id}/approve/')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_comments_by_status(self):
        """Test filtering moderation comments by status."""
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Pending",
            status=CommentStatus.PENDING
        )
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Live",
            status=CommentStatus.LIVE
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get(f'/api/mod/comments/?status={CommentStatus.PENDING}')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class ReportAPITestCase(APITestCase):
    """Test cases for Report API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='user', password='pass')
        self.moderator = User.objects.create_user(
            username='moderator',
            password='pass',
            role=UserRole.MOD
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
            created_by=self.user
        )

    def test_create_report_requires_authentication(self):
        """Test that creating a report requires authentication."""
        response = self.client.post('/api/mod/reports/', {
            'target_type': 'DIFF',
            'target_id': self.diff.id,
            'reason': 'SPAM',
            'description': 'This is spam'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_report(self):
        """Test creating a report."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/mod/reports/', {
            'target_type': 'DIFF',
            'target_id': self.diff.id,
            'reason': 'SPAM',
            'description': 'This is spam'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify report was created
        report = Report.objects.get(id=response.data['id'])
        self.assertEqual(report.created_by, self.user)
        self.assertEqual(report.target_type, 'DIFF')

    def test_user_can_see_own_reports(self):
        """Test that users can see their own reports."""
        Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/mod/reports/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_user_cannot_see_others_reports(self):
        """Test that users cannot see other users' reports."""
        other_user = User.objects.create_user(username='other', password='pass')
        Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=other_user
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/mod/reports/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 0)

    def test_moderator_can_see_all_reports(self):
        """Test that moderators can see all reports."""
        Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.get('/api/mod/reports/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_resolve_report(self):
        """Test resolving a report."""
        report = Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/reports/{report.id}/resolve/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'RESOLVED')

        # Verify in database
        report.refresh_from_db()
        self.assertEqual(report.status, 'RESOLVED')
        self.assertEqual(report.resolved_by, self.moderator)
        self.assertIsNotNone(report.resolved_at)

    def test_dismiss_report(self):
        """Test dismissing a report."""
        report = Report.objects.create(
            target_type='DIFF',
            target_id=self.diff.id,
            reason='SPAM',
            created_by=self.user
        )

        self.client.force_authenticate(user=self.moderator)
        response = self.client.post(f'/api/mod/reports/{report.id}/dismiss/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'DISMISSED')

        # Verify in database
        report.refresh_from_db()
        self.assertEqual(report.status, 'DISMISSED')
