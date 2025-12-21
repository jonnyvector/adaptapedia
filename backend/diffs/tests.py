"""Tests for diffs app."""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import DiffItem, DiffVote, DiffComment, DiffCategory, SpoilerScope, DiffStatus, VoteType, CommentStatus
from works.models import Work
from screen.models import ScreenWork, ScreenWorkType

User = get_user_model()


class DiffItemModelTestCase(TestCase):
    """Test cases for DiffItem model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.work = Work.objects.create(
            title="The Hobbit",
            slug="the-hobbit"
        )
        self.screen_work = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Hobbit Movie",
            slug="the-hobbit-movie"
        )

    def test_create_diff_item(self):
        """Test creating a diff item."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.PLOT,
            claim="Smaug's death is different",
            detail="In the book, Smaug dies over Lake-town...",
            spoiler_scope=SpoilerScope.FULL,
            created_by=self.user
        )
        self.assertEqual(diff.work, self.work)
        self.assertEqual(diff.screen_work, self.screen_work)
        self.assertEqual(diff.category, DiffCategory.PLOT)
        self.assertEqual(diff.claim, "Smaug's death is different")
        self.assertEqual(diff.spoiler_scope, SpoilerScope.FULL)
        self.assertEqual(diff.created_by, self.user)
        self.assertEqual(diff.status, DiffStatus.LIVE)

    def test_diff_item_default_status(self):
        """Test that default status is LIVE."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.CHARACTER,
            claim="Test claim",
            created_by=self.user
        )
        self.assertEqual(diff.status, DiffStatus.LIVE)

    def test_diff_item_default_spoiler_scope(self):
        """Test that default spoiler scope is NONE."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.TONE,
            claim="Test claim",
            created_by=self.user
        )
        self.assertEqual(diff.spoiler_scope, SpoilerScope.NONE)

    def test_diff_item_str_representation(self):
        """Test string representation of DiffItem."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.ENDING,
            claim="This is a very long claim that should be truncated in the string representation",
            created_by=self.user
        )
        str_repr = str(diff)
        self.assertTrue(str_repr.startswith("Ending: "))
        self.assertTrue(len(str_repr) <= 100)

    def test_diff_item_vote_counts_property(self):
        """Test vote_counts property."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.PLOT,
            claim="Test claim",
            created_by=self.user
        )

        # Create some votes
        user2 = User.objects.create_user(username='user2', password='pass')
        user3 = User.objects.create_user(username='user3', password='pass')

        DiffVote.objects.create(diff_item=diff, user=self.user, vote=VoteType.ACCURATE)
        DiffVote.objects.create(diff_item=diff, user=user2, vote=VoteType.ACCURATE)
        DiffVote.objects.create(diff_item=diff, user=user3, vote=VoteType.NEEDS_NUANCE)

        counts = diff.vote_counts
        self.assertEqual(counts['accurate'], 2)
        self.assertEqual(counts['needs_nuance'], 1)
        self.assertEqual(counts['disagree'], 0)

    def test_diff_item_ordering(self):
        """Test that diffs are ordered by created_at descending."""
        diff1 = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.PLOT,
            claim="First",
            created_by=self.user
        )
        diff2 = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.PLOT,
            claim="Second",
            created_by=self.user
        )

        diffs = DiffItem.objects.all()
        self.assertEqual(diffs[0], diff2)
        self.assertEqual(diffs[1], diff1)

    def test_diff_item_related_names(self):
        """Test related name queries."""
        diff = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen_work,
            category=DiffCategory.PLOT,
            claim="Test",
            created_by=self.user
        )

        # Test work.diffs
        self.assertEqual(self.work.diffs.count(), 1)

        # Test screen_work.diffs
        self.assertEqual(self.screen_work.diffs.count(), 1)

        # Test user.created_diffs
        self.assertEqual(self.user.created_diffs.count(), 1)


class DiffVoteModelTestCase(TestCase):
    """Test cases for DiffVote model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='voter', password='pass')
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
            claim="Test claim",
            created_by=self.user
        )

    def test_create_vote(self):
        """Test creating a vote."""
        vote = DiffVote.objects.create(
            diff_item=self.diff,
            user=self.user,
            vote=VoteType.ACCURATE
        )
        self.assertEqual(vote.diff_item, self.diff)
        self.assertEqual(vote.user, self.user)
        self.assertEqual(vote.vote, VoteType.ACCURATE)

    def test_vote_unique_together(self):
        """Test that a user can only vote once per diff."""
        DiffVote.objects.create(
            diff_item=self.diff,
            user=self.user,
            vote=VoteType.ACCURATE
        )

        with self.assertRaises(Exception):
            DiffVote.objects.create(
                diff_item=self.diff,
                user=self.user,
                vote=VoteType.DISAGREE
            )

    def test_vote_str_representation(self):
        """Test string representation of DiffVote."""
        vote = DiffVote.objects.create(
            diff_item=self.diff,
            user=self.user,
            vote=VoteType.NEEDS_NUANCE
        )
        self.assertEqual(str(vote), "voter → Needs Nuance")

    def test_multiple_users_can_vote(self):
        """Test that different users can vote on the same diff."""
        user2 = User.objects.create_user(username='user2', password='pass')

        vote1 = DiffVote.objects.create(
            diff_item=self.diff,
            user=self.user,
            vote=VoteType.ACCURATE
        )
        vote2 = DiffVote.objects.create(
            diff_item=self.diff,
            user=user2,
            vote=VoteType.DISAGREE
        )

        self.assertEqual(self.diff.votes.count(), 2)

    def test_vote_related_names(self):
        """Test related name queries."""
        vote = DiffVote.objects.create(
            diff_item=self.diff,
            user=self.user,
            vote=VoteType.ACCURATE
        )

        # Test diff_item.votes
        self.assertEqual(self.diff.votes.count(), 1)

        # Test user.diff_votes
        self.assertEqual(self.user.diff_votes.count(), 1)


class DiffCommentModelTestCase(TestCase):
    """Test cases for DiffComment model."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='commenter', password='pass')
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
            claim="Test claim",
            created_by=self.user
        )

    def test_create_comment(self):
        """Test creating a comment."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="This is a great observation!",
            spoiler_scope=SpoilerScope.NONE
        )
        self.assertEqual(comment.diff_item, self.diff)
        self.assertEqual(comment.user, self.user)
        self.assertEqual(comment.body, "This is a great observation!")
        self.assertEqual(comment.spoiler_scope, SpoilerScope.NONE)
        self.assertEqual(comment.status, CommentStatus.LIVE)

    def test_comment_default_status(self):
        """Test that default status is LIVE."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test comment"
        )
        self.assertEqual(comment.status, CommentStatus.LIVE)

    def test_comment_default_spoiler_scope(self):
        """Test that default spoiler scope is NONE."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test comment"
        )
        self.assertEqual(comment.spoiler_scope, SpoilerScope.NONE)

    def test_comment_str_representation(self):
        """Test string representation of DiffComment."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test comment"
        )
        str_repr = str(comment)
        self.assertIn("commenter", str_repr)

    def test_comment_ordering(self):
        """Test that comments are ordered by created_at ascending."""
        comment1 = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="First comment"
        )
        comment2 = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Second comment"
        )

        comments = DiffComment.objects.all()
        self.assertEqual(comments[0], comment1)
        self.assertEqual(comments[1], comment2)

    def test_comment_related_names(self):
        """Test related name queries."""
        comment = DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test"
        )

        # Test diff_item.comments
        self.assertEqual(self.diff.comments.count(), 1)

        # Test user.diff_comments
        self.assertEqual(self.user.diff_comments.count(), 1)

    def test_multiple_comments_allowed(self):
        """Test that multiple comments can be created."""
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="First"
        )
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Second"
        )

        self.assertEqual(self.diff.comments.count(), 2)


class DiffItemAPITestCase(APITestCase):
    """Test cases for DiffItem API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.work = Work.objects.create(title="The Hobbit", slug="the-hobbit")
        self.screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Hobbit Movie",
            slug="the-hobbit-movie"
        )

    def test_list_diffs_unauthenticated(self):
        """Test listing diffs without authentication."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Test diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get('/api/diffs/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_diffs_only_shows_live(self):
        """Test that only LIVE diffs are shown in list."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Live diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )
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
            claim="Hidden diff",
            status=DiffStatus.HIDDEN,
            created_by=self.user
        )

        response = self.client.get('/api/diffs/items/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

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
        """Test creating a diff when authenticated."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/diffs/items/', {
            'work': self.work.id,
            'screen_work': self.screen.id,
            'category': DiffCategory.CHARACTER,
            'claim': 'Legolas is not in the book',
            'detail': 'Legolas appears in the movie but not the book.',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['claim'], 'Legolas is not in the book')
        self.assertEqual(response.data['status'], DiffStatus.PENDING)

        # Verify created_by is set
        diff = DiffItem.objects.get(id=response.data['id'])
        self.assertEqual(diff.created_by, self.user)

    def test_filter_diffs_by_work(self):
        """Test filtering diffs by work."""
        work2 = Work.objects.create(title="Another Book", slug="another-book")

        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Diff 1",
            status=DiffStatus.LIVE,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=work2,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Diff 2",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get(f'/api/diffs/items/?work={self.work.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_diffs_by_screen_work(self):
        """Test filtering diffs by screen work."""
        screen2 = ScreenWork.objects.create(
            type=ScreenWorkType.TV,
            title="TV Show",
            slug="tv-show"
        )

        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Diff 1",
            status=DiffStatus.LIVE,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=screen2,
            category=DiffCategory.PLOT,
            claim="Diff 2",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get(f'/api/diffs/items/?screen_work={self.screen.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_diffs_by_category(self):
        """Test filtering diffs by category."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="Plot diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.CHARACTER,
            claim="Character diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get(f'/api/diffs/items/?category={DiffCategory.PLOT}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_diffs_by_spoiler_scope(self):
        """Test filtering diffs by spoiler scope."""
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.PLOT,
            claim="No spoilers",
            spoiler_scope=SpoilerScope.NONE,
            status=DiffStatus.LIVE,
            created_by=self.user
        )
        DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.ENDING,
            claim="Ending spoiler",
            spoiler_scope=SpoilerScope.FULL,
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        response = self.client.get(f'/api/diffs/items/?spoiler_scope={SpoilerScope.NONE}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)


class DiffVoteAPITestCase(APITestCase):
    """Test cases for voting on diffs."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='voter', password='pass')
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

    def test_vote_requires_authentication(self):
        """Test that voting requires authentication."""
        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': VoteType.ACCURATE}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_vote_on_diff(self):
        """Test voting on a diff."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': VoteType.ACCURATE}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['vote'], VoteType.ACCURATE)

        # Verify vote was created
        vote = DiffVote.objects.get(diff_item=self.diff, user=self.user)
        self.assertEqual(vote.vote, VoteType.ACCURATE)

    def test_vote_update_existing(self):
        """Test updating an existing vote."""
        self.client.force_authenticate(user=self.user)

        # Create initial vote
        self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': VoteType.ACCURATE}
        )

        # Update vote
        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {'vote': VoteType.DISAGREE}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['vote'], VoteType.DISAGREE)

        # Verify only one vote exists
        self.assertEqual(DiffVote.objects.filter(diff_item=self.diff, user=self.user).count(), 1)

    def test_vote_missing_vote_field(self):
        """Test voting without vote field."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            f'/api/diffs/items/{self.diff.id}/vote/',
            {}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DiffCommentAPITestCase(APITestCase):
    """Test cases for DiffComment API."""

    def setUp(self):
        """Set up test data."""
        self.user = User.objects.create_user(username='commenter', password='pass')
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

    def test_list_comments_unauthenticated(self):
        """Test listing comments without authentication."""
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Test comment",
            status=CommentStatus.LIVE
        )

        response = self.client.get('/api/diffs/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_comments_only_shows_live(self):
        """Test that only LIVE comments are shown."""
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Live comment",
            status=CommentStatus.LIVE
        )
        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Hidden comment",
            status=CommentStatus.HIDDEN
        )

        response = self.client.get('/api/diffs/comments/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_create_comment_requires_authentication(self):
        """Test that creating a comment requires authentication."""
        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'New comment',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_comment_authenticated(self):
        """Test creating a comment when authenticated."""
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/diffs/comments/', {
            'diff_item': self.diff.id,
            'body': 'Great observation!',
            'spoiler_scope': SpoilerScope.NONE
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['body'], 'Great observation!')

        # Verify user is set
        comment = DiffComment.objects.get(id=response.data['id'])
        self.assertEqual(comment.user, self.user)

    def test_filter_comments_by_diff_item(self):
        """Test filtering comments by diff item."""
        diff2 = DiffItem.objects.create(
            work=self.work,
            screen_work=self.screen,
            category=DiffCategory.CHARACTER,
            claim="Another diff",
            status=DiffStatus.LIVE,
            created_by=self.user
        )

        DiffComment.objects.create(
            diff_item=self.diff,
            user=self.user,
            body="Comment 1",
            status=CommentStatus.LIVE
        )
        DiffComment.objects.create(
            diff_item=diff2,
            user=self.user,
            body="Comment 2",
            status=CommentStatus.LIVE
        )

        response = self.client.get(f'/api/diffs/comments/?diff_item={self.diff.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
