"""Tests for works app."""
from django.test import TestCase
from django.utils.text import slugify
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Work
from .services import SimilarBooksService
from screen.models import ScreenWork, AdaptationEdge


class WorkModelTestCase(TestCase):
    """Test cases for Work model."""

    def test_create_work(self):
        """Test creating a work."""
        work = Work.objects.create(
            title="The Lord of the Rings",
            summary="A fantasy epic about a ring.",
            year=1954,
            language="en"
        )
        self.assertEqual(work.title, "The Lord of the Rings")
        self.assertEqual(work.summary, "A fantasy epic about a ring.")
        self.assertEqual(work.year, 1954)
        self.assertEqual(work.language, "en")
        self.assertIsNotNone(work.created_at)
        self.assertIsNotNone(work.updated_at)

    def test_work_slug_auto_generation(self):
        """Test that slug is automatically generated from title."""
        work = Work.objects.create(title="The Hobbit")
        self.assertEqual(work.slug, "the-hobbit")

    def test_work_slug_custom(self):
        """Test providing custom slug."""
        work = Work.objects.create(
            title="The Lord of the Rings",
            slug="lotr"
        )
        self.assertEqual(work.slug, "lotr")

    def test_work_slug_unique(self):
        """Test that slug must be unique."""
        Work.objects.create(title="Test Book", slug="test-book")

        with self.assertRaises(Exception):
            Work.objects.create(title="Another Book", slug="test-book")

    def test_work_str_representation(self):
        """Test string representation of Work."""
        work = Work.objects.create(title="Test Book")
        self.assertEqual(str(work), "Test Book")

    def test_work_ordering(self):
        """Test that works are ordered by created_at descending."""
        work1 = Work.objects.create(title="First Book")
        work2 = Work.objects.create(title="Second Book")
        work3 = Work.objects.create(title="Third Book")

        works = Work.objects.all()
        self.assertEqual(works[0], work3)
        self.assertEqual(works[1], work2)
        self.assertEqual(works[2], work1)

    def test_work_wikidata_qid_unique(self):
        """Test that wikidata_qid must be unique."""
        Work.objects.create(title="Book 1", wikidata_qid="Q123")

        with self.assertRaises(Exception):
            Work.objects.create(title="Book 2", wikidata_qid="Q123")

    def test_work_openlibrary_work_id_unique(self):
        """Test that openlibrary_work_id must be unique."""
        Work.objects.create(title="Book 1", openlibrary_work_id="OL123W")

        with self.assertRaises(Exception):
            Work.objects.create(title="Book 2", openlibrary_work_id="OL123W")

    def test_work_optional_fields(self):
        """Test that optional fields can be blank."""
        work = Work.objects.create(title="Minimal Book")
        self.assertEqual(work.summary, "")
        self.assertIsNone(work.year)
        self.assertEqual(work.language, "")
        self.assertIsNone(work.wikidata_qid)
        self.assertIsNone(work.openlibrary_work_id)
        self.assertEqual(work.cover_url, "")


class WorkAPITestCase(APITestCase):
    """Test cases for Work API."""

    def setUp(self):
        """Set up test data."""
        self.work1 = Work.objects.create(
            title="The Lord of the Rings",
            slug="lotr",
            summary="A fantasy epic.",
            year=1954
        )
        self.work2 = Work.objects.create(
            title="The Hobbit",
            slug="the-hobbit",
            summary="A prequel to LOTR.",
            year=1937
        )
        self.work3 = Work.objects.create(
            title="Harry Potter and the Philosopher's Stone",
            slug="harry-potter-1",
            summary="A young wizard's adventure.",
            year=1997
        )

    def test_list_works(self):
        """Test listing all works."""
        response = self.client.get('/api/works/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)
        self.assertEqual(len(response.data['results']), 3)

    def test_get_work_detail(self):
        """Test getting a single work by slug."""
        response = self.client.get(f'/api/works/{self.work1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "The Lord of the Rings")
        self.assertEqual(response.data['slug'], "lotr")

    def test_get_work_detail_not_found(self):
        """Test getting a work that doesn't exist."""
        response = self.client.get('/api/works/nonexistent/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_works_by_title(self):
        """Test searching works by title."""
        response = self.client.get('/api/works/?search=hobbit')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], "The Hobbit")

    def test_search_works_by_summary(self):
        """Test searching works by summary."""
        response = self.client.get('/api/works/?search=wizard')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], "Harry Potter and the Philosopher's Stone")

    def test_filter_works_by_year(self):
        """Test filtering works by year."""
        response = self.client.get('/api/works/?year=1954')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['year'], 1954)

    def test_ordering_works_by_year(self):
        """Test ordering works by year."""
        response = self.client.get('/api/works/?ordering=year')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        years = [work['year'] for work in response.data['results']]
        self.assertEqual(years, [1937, 1954, 1997])

    def test_ordering_works_by_year_descending(self):
        """Test ordering works by year descending."""
        response = self.client.get('/api/works/?ordering=-year')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        years = [work['year'] for work in response.data['results']]
        self.assertEqual(years, [1997, 1954, 1937])

    def test_works_are_read_only(self):
        """Test that works API is read-only."""
        # Test POST
        response = self.client.post('/api/works/', {
            'title': 'New Book',
            'slug': 'new-book'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test PUT
        response = self.client.put(f'/api/works/{self.work1.slug}/', {
            'title': 'Updated Title'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

        # Test DELETE
        response = self.client.delete(f'/api/works/{self.work1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_pagination(self):
        """Test pagination of works list."""
        # Create more works to test pagination
        for i in range(60):
            Work.objects.create(title=f"Book {i}", slug=f"book-{i}")

        response = self.client.get('/api/works/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('next', response.data)
        self.assertIn('previous', response.data)
        # Default page size is 50
        self.assertEqual(len(response.data['results']), 50)

    def test_ordering_by_title(self):
        """Test ordering works by title."""
        response = self.client.get('/api/works/?ordering=title')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [work['title'] for work in response.data['results']]
        self.assertEqual(titles, sorted(titles))


class SimilarBooksServiceTestCase(TestCase):
    """Test cases for SimilarBooksService."""

    def setUp(self):
        """Set up test data."""
        # Create fantasy books by Tolkien
        self.lotr = Work.objects.create(
            title="The Lord of the Rings",
            author="J.R.R. Tolkien",
            genre="Fantasy",
            year=1954
        )
        self.hobbit = Work.objects.create(
            title="The Hobbit",
            author="J.R.R. Tolkien",
            genre="Fantasy",
            year=1937
        )
        self.silmarillion = Work.objects.create(
            title="The Silmarillion",
            author="J.R.R. Tolkien",
            genre="Fantasy",
            year=1977
        )

        # Create other fantasy books
        self.harry_potter = Work.objects.create(
            title="Harry Potter and the Philosopher's Stone",
            author="J.K. Rowling",
            genre="Fantasy",
            year=1997
        )
        self.narnia = Work.objects.create(
            title="The Lion, the Witch and the Wardrobe",
            author="C.S. Lewis",
            genre="Fantasy",
            year=1950
        )

        # Create non-fantasy book
        self.pride_prejudice = Work.objects.create(
            title="Pride and Prejudice",
            author="Jane Austen",
            genre="Romance",
            year=1813
        )

        # Create screen adaptations for some books
        screen1 = ScreenWork.objects.create(
            type="MOVIE",
            title="The Lord of the Rings: The Fellowship of the Ring",
            year=2001
        )
        screen2 = ScreenWork.objects.create(
            type="MOVIE",
            title="The Hobbit: An Unexpected Journey",
            year=2012
        )
        screen3 = ScreenWork.objects.create(
            type="MOVIE",
            title="Harry Potter and the Philosopher's Stone",
            year=2001
        )

        # Create adaptation edges
        AdaptationEdge.objects.create(work=self.lotr, screen_work=screen1)
        AdaptationEdge.objects.create(work=self.hobbit, screen_work=screen2)
        AdaptationEdge.objects.create(work=self.harry_potter, screen_work=screen3)

    def test_similar_books_same_author(self):
        """Test finding similar books by same author."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=6)
        similar_ids = [book.id for book in similar]

        # Should include other Tolkien books
        self.assertIn(self.hobbit.id, similar_ids)
        self.assertIn(self.silmarillion.id, similar_ids)

    def test_similar_books_same_genre(self):
        """Test finding similar books by same genre."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=6)
        similar_ids = [book.id for book in similar]

        # Should include other fantasy books
        self.assertIn(self.harry_potter.id, similar_ids)
        self.assertIn(self.narnia.id, similar_ids)

    def test_similar_books_excludes_current(self):
        """Test that similar books excludes the current book."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=6)
        similar_ids = [book.id for book in similar]

        # Should NOT include the current book
        self.assertNotIn(self.lotr.id, similar_ids)

    def test_similar_books_excludes_different_genre(self):
        """Test that books with different genre get lower priority."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=6)
        similar_ids = [book.id for book in similar]

        # Romance book should not be in results (or be very low priority)
        # This might be included if we have very few books, but should be last
        if self.pride_prejudice.id in similar_ids:
            # If included, should be last (lowest score)
            self.assertEqual(similar[-1].id, self.pride_prejudice.id)

    def test_similar_books_scoring_priority(self):
        """Test that scoring prioritizes genre + author match."""
        similar = list(SimilarBooksService.get_similar_books(self.lotr, limit=6))

        # Tolkien fantasy books should rank higher than non-Tolkien fantasy
        tolkien_books = [book for book in similar if book.author == "J.R.R. Tolkien"]
        non_tolkien_fantasy = [book for book in similar if book.author != "J.R.R. Tolkien" and book.genre == "Fantasy"]

        if tolkien_books and non_tolkien_fantasy:
            # Tolkien books should have higher similarity scores
            self.assertGreater(tolkien_books[0].similarity_score, non_tolkien_fantasy[0].similarity_score)

    def test_similar_books_adaptation_count_annotation(self):
        """Test that adaptation_count is properly annotated."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=6)

        for book in similar:
            # Check that adaptation_count attribute exists
            self.assertTrue(hasattr(book, 'adaptation_count'))
            # Verify specific counts
            if book.id == self.hobbit.id:
                self.assertEqual(book.adaptation_count, 1)
            elif book.id == self.harry_potter.id:
                self.assertEqual(book.adaptation_count, 1)
            elif book.id == self.silmarillion.id:
                self.assertEqual(book.adaptation_count, 0)

    def test_similar_books_limit(self):
        """Test that limit parameter is respected."""
        similar = SimilarBooksService.get_similar_books(self.lotr, limit=2)
        self.assertLessEqual(len(similar), 2)

        similar = SimilarBooksService.get_similar_books(self.lotr, limit=10)
        # Should not exceed available similar books (excluding current)
        self.assertLessEqual(len(similar), Work.objects.count() - 1)

    def test_similar_books_no_matches(self):
        """Test similar books when there are no good matches."""
        # Create a unique book with no similar attributes
        unique_book = Work.objects.create(
            title="Unique Scientific Paper",
            author="Dr. Unique",
            genre="Academic",
            year=2020
        )

        similar = SimilarBooksService.get_similar_books(unique_book, limit=6)
        # Should return empty or very few results with low scores
        for book in similar:
            self.assertLess(book.similarity_score, 5)  # Low score threshold


class SimilarBooksAPITestCase(APITestCase):
    """Test cases for Similar Books API endpoint."""

    def setUp(self):
        """Set up test data."""
        self.work1 = Work.objects.create(
            title="The Lord of the Rings",
            slug="lotr",
            author="J.R.R. Tolkien",
            genre="Fantasy",
            year=1954
        )
        self.work2 = Work.objects.create(
            title="The Hobbit",
            slug="the-hobbit",
            author="J.R.R. Tolkien",
            genre="Fantasy",
            year=1937
        )
        self.work3 = Work.objects.create(
            title="Harry Potter",
            slug="harry-potter",
            author="J.K. Rowling",
            genre="Fantasy",
            year=1997
        )

    def test_similar_books_endpoint(self):
        """Test the similar books API endpoint."""
        response = self.client.get(f'/api/works/{self.work1.slug}/similar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)

    def test_similar_books_response_structure(self):
        """Test that similar books response has correct structure."""
        response = self.client.get(f'/api/works/{self.work1.slug}/similar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data['results']
        if len(results) > 0:
            book = results[0]
            # Check that all expected fields are present
            self.assertIn('id', book)
            self.assertIn('title', book)
            self.assertIn('slug', book)
            self.assertIn('author', book)
            self.assertIn('year', book)
            self.assertIn('genre', book)
            self.assertIn('cover_url', book)
            self.assertIn('adaptation_count', book)
            self.assertIn('similarity_score', book)

    def test_similar_books_limit_parameter(self):
        """Test that limit parameter works."""
        response = self.client.get(f'/api/works/{self.work1.slug}/similar/?limit=1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertLessEqual(len(response.data['results']), 1)

    def test_similar_books_max_limit(self):
        """Test that limit is capped at maximum."""
        response = self.client.get(f'/api/works/{self.work1.slug}/similar/?limit=100')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should be capped at 20
        self.assertLessEqual(len(response.data['results']), 20)

    def test_similar_books_not_found(self):
        """Test similar books for non-existent work."""
        response = self.client.get('/api/works/nonexistent/similar/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
