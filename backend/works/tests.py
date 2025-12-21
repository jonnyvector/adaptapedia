"""Tests for works app."""
from django.test import TestCase
from django.utils.text import slugify
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Work


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
