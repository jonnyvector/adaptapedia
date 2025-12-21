"""Tests for spoiler filtering functionality."""
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import DiffItem, DiffComment, DiffCategory, DiffStatus, SpoilerScope, CommentStatus
from works.models import Work
from screen.models import ScreenWork, ScreenWorkType

User = get_user_model()


class SpoilerFilteringTestCase(APITestCase):
    """Test cases for spoiler filtering in diff items."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.work = Work.objects.create(title="The Hobbit", slug="the-hobbit")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Hobbit Movie",
            slug="the-hobbit-movie"
        )

        # Create diffs with different spoiler scopes
        self.diff_none = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.TONE,
            claim="The tone is lighter",
            spoiler_scope=SpoilerScope.NONE,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        self.diff_book_only = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Smaug's dialogue is different",
            spoiler_scope=SpoilerScope.BOOK_ONLY,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        self.diff_screen_only = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.CHARACTER,
            claim="Legolas appears in the movie",
            spoiler_scope=SpoilerScope.SCREEN_ONLY,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        self.diff_full = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.ENDING,
            claim="The ending is completely different",
            spoiler_scope=SpoilerScope.FULL,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

    def test_filter_max_spoiler_scope_none(self):
        """Test filtering with max_spoiler_scope=NONE."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.NONE}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['spoiler_scope'], SpoilerScope.NONE)

    def test_filter_max_spoiler_scope_book_only(self):
        """Test filtering with max_spoiler_scope=BOOK_ONLY."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.BOOK_ONLY}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include NONE and BOOK_ONLY
        self.assertEqual(response.data['count'], 2)

        scopes = [item['spoiler_scope'] for item in response.data['results']]
        self.assertIn(SpoilerScope.NONE, scopes)
        self.assertIn(SpoilerScope.BOOK_ONLY, scopes)
        self.assertNotIn(SpoilerScope.SCREEN_ONLY, scopes)
        self.assertNotIn(SpoilerScope.FULL, scopes)

    def test_filter_max_spoiler_scope_screen_only(self):
        """Test filtering with max_spoiler_scope=SCREEN_ONLY."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.SCREEN_ONLY}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include NONE and SCREEN_ONLY
        self.assertEqual(response.data['count'], 2)

        scopes = [item['spoiler_scope'] for item in response.data['results']]
        self.assertIn(SpoilerScope.NONE, scopes)
        self.assertNotIn(SpoilerScope.BOOK_ONLY, scopes)
        self.assertIn(SpoilerScope.SCREEN_ONLY, scopes)
        self.assertNotIn(SpoilerScope.FULL, scopes)

    def test_filter_max_spoiler_scope_full(self):
        """Test filtering with max_spoiler_scope=FULL."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.FULL}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should include all diffs
        self.assertEqual(response.data['count'], 4)

    def test_no_max_spoiler_scope_filter_shows_all(self):
        """Test that without max_spoiler_scope, all diffs are shown."""
        response = self.client.get('/api/diffs/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 4)

    def test_spoiler_scope_hierarchy_none(self):
        """Test spoiler hierarchy: NONE level."""
        # User with NONE spoiler preference should only see NONE
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.NONE}')

        scopes = [item['spoiler_scope'] for item in response.data['results']]
        for scope in scopes:
            self.assertEqual(scope, SpoilerScope.NONE)

    def test_spoiler_scope_hierarchy_book_only(self):
        """Test spoiler hierarchy: BOOK_ONLY includes NONE."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.BOOK_ONLY}')

        scopes = [item['spoiler_scope'] for item in response.data['results']]
        allowed_scopes = [SpoilerScope.NONE, SpoilerScope.BOOK_ONLY]

        for scope in scopes:
            self.assertIn(scope, allowed_scopes)

    def test_spoiler_scope_hierarchy_screen_only(self):
        """Test spoiler hierarchy: SCREEN_ONLY includes NONE."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.SCREEN_ONLY}')

        scopes = [item['spoiler_scope'] for item in response.data['results']]
        allowed_scopes = [SpoilerScope.NONE, SpoilerScope.SCREEN_ONLY]

        for scope in scopes:
            self.assertIn(scope, allowed_scopes)

    def test_spoiler_scope_hierarchy_full(self):
        """Test spoiler hierarchy: FULL includes all."""
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.FULL}')

        scopes = set([item['spoiler_scope'] for item in response.data['results']])
        expected_scopes = {
            SpoilerScope.NONE,
            SpoilerScope.BOOK_ONLY,
            SpoilerScope.SCREEN_ONLY,
            SpoilerScope.FULL
        }

        self.assertEqual(scopes, expected_scopes)

    def test_combine_spoiler_filter_with_work_filter(self):
        """Test combining spoiler filter with work filter."""
        # Create another work with diffs
        work2 = Work.objects.create(title="Another Book", slug="another-book")
        DiffItem.objects.create(
            work=work2,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Different story",
            spoiler_scope=SpoilerScope.FULL,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get(
            f'/api/diffs/items/?work={self.work.id}&max_spoiler_scope={SpoilerScope.NONE}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['spoiler_scope'], SpoilerScope.NONE)

    def test_combine_spoiler_filter_with_category_filter(self):
        """Test combining spoiler filter with category filter."""
        response = self.client.get(
            f'/api/diffs/items/?category={DiffCategory.ENDING}&max_spoiler_scope={SpoilerScope.FULL}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['category'], DiffCategory.ENDING)

    def test_invalid_max_spoiler_scope(self):
        """Test with invalid max_spoiler_scope value."""
        response = self.client.get('/api/diffs/items/?max_spoiler_scope=INVALID')
        # Should still return results, just won't filter
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CommentSpoilerFilteringTestCase(APITestCase):
    """Test cases for spoiler filtering in comments."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='testuser', password='pass')
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

    def test_comment_spoiler_scopes(self):
        """Test creating comments with different spoiler scopes."""
        self.client.force_authenticate(user=self.user)

        # Create comment with NONE spoiler scope
        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'Safe comment',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['spoiler_scope'], SpoilerScope.NONE)

        # Create comment with FULL spoiler scope
        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'Spoiler comment',
            'spoiler_scope': SpoilerScope.FULL
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['spoiler_scope'], SpoilerScope.FULL)

    def test_comment_default_spoiler_scope(self):
        """Test that comment default spoiler scope is NONE."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'Comment without explicit scope'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['spoiler_scope'], SpoilerScope.NONE)


class SpoilerScopeLogicTestCase(APITestCase):
    """Test cases for spoiler scope logic and hierarchy."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='testuser', password='pass')
        self.work = Work.objects.create(title="Book", slug="book")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie",
            slug="movie"
        )

    def test_spoiler_scope_order_none_is_lowest(self):
        """Test that NONE is the lowest spoiler level."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.TONE,
            claim="NONE level",
            spoiler_scope=SpoilerScope.NONE,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        # NONE should be visible at all levels
        for scope in [SpoilerScope.NONE, SpoilerScope.BOOK_ONLY,
                      SpoilerScope.SCREEN_ONLY, SpoilerScope.FULL]:
            response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={scope}')
            self.assertEqual(response.data['count'], 1)

    def test_spoiler_scope_order_full_is_highest(self):
        """Test that FULL is the highest spoiler level."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.ENDING,
            claim="FULL level",
            spoiler_scope=SpoilerScope.FULL,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        # FULL should only be visible at FULL level
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.NONE}')
        self.assertEqual(response.data['count'], 0)

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.BOOK_ONLY}')
        self.assertEqual(response.data['count'], 0)

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.SCREEN_ONLY}')
        self.assertEqual(response.data['count'], 0)

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.FULL}')
        self.assertEqual(response.data['count'], 1)

    def test_book_only_and_screen_only_same_level(self):
        """Test that BOOK_ONLY and SCREEN_ONLY are at the same level."""
        diff_book = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Book spoiler",
            spoiler_scope=SpoilerScope.BOOK_ONLY,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        diff_screen = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.CHARACTER,
            claim="Screen spoiler",
            spoiler_scope=SpoilerScope.SCREEN_ONLY,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        # BOOK_ONLY filter should not show SCREEN_ONLY
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.BOOK_ONLY}')
        scopes = [item['spoiler_scope'] for item in response.data['results']]
        self.assertIn(SpoilerScope.BOOK_ONLY, scopes)
        self.assertNotIn(SpoilerScope.SCREEN_ONLY, scopes)

        # SCREEN_ONLY filter should not show BOOK_ONLY
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.SCREEN_ONLY}')
        scopes = [item['spoiler_scope'] for item in response.data['results']]
        self.assertIn(SpoilerScope.SCREEN_ONLY, scopes)
        self.assertNotIn(SpoilerScope.BOOK_ONLY, scopes)

    def test_multiple_diffs_different_scopes(self):
        """Test filtering with multiple diffs at different spoiler levels."""
        # Create 10 diffs with various spoiler scopes
        for i in range(3):
            DiffItem.objects.create(
                work=self.work,
                screen_work=self.screen,
                category=DiffCategory.PLOT,
                claim=f"NONE {i}",
                spoiler_scope=SpoilerScope.NONE,
                status=DiffStatus.LIVE,
                created_by=self.user
            )

        for i in range(2):
            DiffItem.objects.create(
                work=self.work,
                screen_work=self.screen,
                category=DiffCategory.PLOT,
                claim=f"BOOK {i}",
                spoiler_scope=SpoilerScope.BOOK_ONLY,
                status=DiffStatus.LIVE,
                created_by=self.user
            )

        for i in range(2):
            DiffItem.objects.create(
                work=self.work,
                screen_work=self.screen,
                category=DiffCategory.PLOT,
                claim=f"SCREEN {i}",
                spoiler_scope=SpoilerScope.SCREEN_ONLY,
                status=DiffStatus.LIVE,
                created_by=self.user
            )

        for i in range(3):
            DiffItem.objects.create(
                work=self.work,
                screen_work=self.screen,
                category=DiffCategory.ENDING,
                claim=f"FULL {i}",
                spoiler_scope=SpoilerScope.FULL,
                status=DiffStatus.LIVE,
                created_by=self.user
            )

        # Test counts at each level
        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.NONE}')
        self.assertEqual(response.data['count'], 3)

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.BOOK_ONLY}')
        self.assertEqual(response.data['count'], 5)  # 3 NONE + 2 BOOK_ONLY

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.SCREEN_ONLY}')
        self.assertEqual(response.data['count'], 5)  # 3 NONE + 2 SCREEN_ONLY

        response = self.client.get(f'/api/diffs/items/?max_spoiler_scope={SpoilerScope.FULL}')
        self.assertEqual(response.data['count'], 10)  # All diffs
