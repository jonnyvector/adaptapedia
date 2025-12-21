"""Tests for screen app."""
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import ScreenWork, ScreenWorkType, AdaptationEdge
from works.models import Work


class ScreenWorkModelTestCase(TestCase):
    """Test cases for ScreenWork model."""

    def test_create_movie(self):
        """Test creating a movie."""
        movie = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Lord of the Rings: The Fellowship of the Ring",
            summary="First part of the trilogy.",
            year=2001
        )
        self.assertEqual(movie.type, ScreenWorkType.MOVIE)
        self.assertEqual(movie.title, "The Lord of the Rings: The Fellowship of the Ring")
        self.assertEqual(movie.year, 2001)
        self.assertIsNotNone(movie.created_at)

    def test_create_tv_series(self):
        """Test creating a TV series."""
        tv = ScreenWork.objects.create(
            type=ScreenWorkType.TV,
            title="Game of Thrones",
            year=2011
        )
        self.assertEqual(tv.type, ScreenWorkType.TV)
        self.assertEqual(tv.title, "Game of Thrones")

    def test_screenwork_slug_auto_generation(self):
        """Test that slug is automatically generated."""
        movie = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Matrix"
        )
        self.assertEqual(movie.slug, "the-matrix")

    def test_screenwork_slug_unique(self):
        """Test that slug must be unique."""
        ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Test Movie",
            slug="test-movie"
        )

        with self.assertRaises(Exception):
            ScreenWork.objects.create(
                type=ScreenWorkType.TV,
                title="Another Show",
                slug="test-movie"
            )

    def test_screenwork_str_representation(self):
        """Test string representation of ScreenWork."""
        movie = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Inception"
        )
        self.assertEqual(str(movie), "Inception (Movie)")

        tv = ScreenWork.objects.create(
            type=ScreenWorkType.TV,
            title="Breaking Bad"
        )
        self.assertEqual(str(tv), "Breaking Bad (TV Series)")

    def test_screenwork_wikidata_qid_unique(self):
        """Test that wikidata_qid must be unique."""
        ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie 1",
            wikidata_qid="Q999"
        )

        with self.assertRaises(Exception):
            ScreenWork.objects.create(
                type=ScreenWorkType.MOVIE,
                title="Movie 2",
                wikidata_qid="Q999"
            )

    def test_screenwork_tmdb_id_unique(self):
        """Test that tmdb_id must be unique."""
        ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie 1",
            tmdb_id=12345
        )

        with self.assertRaises(Exception):
            ScreenWork.objects.create(
                type=ScreenWorkType.MOVIE,
                title="Movie 2",
                tmdb_id=12345
            )

    def test_screenwork_optional_fields(self):
        """Test that optional fields can be blank."""
        screen = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Minimal Movie"
        )
        self.assertEqual(screen.summary, "")
        self.assertIsNone(screen.year)
        self.assertIsNone(screen.wikidata_qid)
        self.assertIsNone(screen.tmdb_id)
        self.assertEqual(screen.poster_url, "")


class AdaptationEdgeModelTestCase(TestCase):
    """Test cases for AdaptationEdge model."""

    def setUp(self):
        """Set up test data."""
        self.work = Work.objects.create(
            title="The Lord of the Rings",
            slug="lotr"
        )
        self.movie = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="LOTR: Fellowship",
            slug="lotr-fellowship"
        )

    def test_create_adaptation_edge(self):
        """Test creating an adaptation relationship."""
        edge = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie,
            relation_type=AdaptationEdge.RelationType.BASED_ON,
            source=AdaptationEdge.Source.WIKIDATA
        )
        self.assertEqual(edge.work, self.work)
        self.assertEqual(edge.screen_work, self.movie)
        self.assertEqual(edge.relation_type, AdaptationEdge.RelationType.BASED_ON)
        self.assertEqual(edge.source, AdaptationEdge.Source.WIKIDATA)
        self.assertEqual(edge.confidence, 100)

    def test_adaptation_edge_default_values(self):
        """Test default values for adaptation edge."""
        edge = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie
        )
        self.assertEqual(edge.relation_type, AdaptationEdge.RelationType.BASED_ON)
        self.assertEqual(edge.source, AdaptationEdge.Source.WIKIDATA)
        self.assertEqual(edge.confidence, 100)

    def test_adaptation_edge_unique_together(self):
        """Test that work and screen_work combination must be unique."""
        AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie
        )

        with self.assertRaises(Exception):
            AdaptationEdge.objects.create(
                work=self.work,
                screen_work=self.movie
            )

    def test_adaptation_edge_str_representation(self):
        """Test string representation of AdaptationEdge."""
        edge = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie
        )
        self.assertEqual(str(edge), "LOTR: Fellowship → The Lord of the Rings")

    def test_adaptation_edge_relation_types(self):
        """Test different relation types."""
        edge1 = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie,
            relation_type=AdaptationEdge.RelationType.BASED_ON
        )
        self.assertEqual(edge1.relation_type, AdaptationEdge.RelationType.BASED_ON)

        movie2 = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Movie 2",
            slug="movie-2"
        )
        edge2 = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=movie2,
            relation_type=AdaptationEdge.RelationType.INSPIRED_BY
        )
        self.assertEqual(edge2.relation_type, AdaptationEdge.RelationType.INSPIRED_BY)

    def test_adaptation_edge_related_names(self):
        """Test related name queries."""
        AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie
        )

        # Test work.adaptations
        self.assertEqual(self.work.adaptations.count(), 1)
        self.assertEqual(self.work.adaptations.first().screen_work, self.movie)

        # Test screen_work.source_works
        self.assertEqual(self.movie.source_works.count(), 1)
        self.assertEqual(self.movie.source_works.first().work, self.work)

    def test_adaptation_edge_cascade_delete(self):
        """Test that edge is deleted when work or screen_work is deleted."""
        edge = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie
        )

        # Delete work
        self.work.delete()
        self.assertFalse(AdaptationEdge.objects.filter(id=edge.id).exists())


class ScreenWorkAPITestCase(APITestCase):
    """Test cases for ScreenWork API."""

    def setUp(self):
        """Set up test data."""
        self.movie1 = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="The Lord of the Rings: The Fellowship of the Ring",
            slug="lotr-fellowship",
            summary="First part of trilogy.",
            year=2001
        )
        self.movie2 = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="Harry Potter and the Philosopher's Stone",
            slug="harry-potter-1-movie",
            summary="Wizard movie.",
            year=2001
        )
        self.tv = ScreenWork.objects.create(
            type=ScreenWorkType.TV,
            title="Game of Thrones",
            slug="got",
            summary="Fantasy TV series.",
            year=2011
        )

    def test_list_screen_works(self):
        """Test listing all screen works."""
        response = self.client.get('/api/screen/works/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 3)

    def test_get_screen_work_detail(self):
        """Test getting a single screen work by slug."""
        response = self.client.get(f'/api/screen/works/{self.movie1.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "The Lord of the Rings: The Fellowship of the Ring")
        self.assertEqual(response.data['type'], ScreenWorkType.MOVIE)

    def test_filter_screen_works_by_type_movie(self):
        """Test filtering screen works by type - movies."""
        response = self.client.get('/api/screen/works/?type=MOVIE')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        for result in response.data['results']:
            self.assertEqual(result['type'], ScreenWorkType.MOVIE)

    def test_filter_screen_works_by_type_tv(self):
        """Test filtering screen works by type - TV series."""
        response = self.client.get('/api/screen/works/?type=TV')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['type'], ScreenWorkType.TV)

    def test_filter_screen_works_by_year(self):
        """Test filtering screen works by year."""
        response = self.client.get('/api/screen/works/?year=2001')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_search_screen_works(self):
        """Test searching screen works."""
        response = self.client.get('/api/screen/works/?search=potter')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], "Harry Potter and the Philosopher's Stone")

    def test_screen_works_are_read_only(self):
        """Test that screen works API is read-only."""
        response = self.client.post('/api/screen/works/', {
            'type': ScreenWorkType.MOVIE,
            'title': 'New Movie'
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class AdaptationEdgeAPITestCase(APITestCase):
    """Test cases for AdaptationEdge API."""

    def setUp(self):
        """Set up test data."""
        self.work = Work.objects.create(
            title="The Lord of the Rings",
            slug="lotr"
        )
        self.movie = ScreenWork.objects.create(
            type=ScreenWorkType.MOVIE,
            title="LOTR: Fellowship",
            slug="lotr-fellowship"
        )
        self.edge = AdaptationEdge.objects.create(
            work=self.work,
            screen_work=self.movie,
            relation_type=AdaptationEdge.RelationType.BASED_ON
        )

    def test_list_adaptation_edges(self):
        """Test listing adaptation edges."""
        response = self.client.get('/api/screen/adaptations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_adaptation_edges_by_work(self):
        """Test filtering edges by work."""
        response = self.client.get(f'/api/screen/adaptations/?work={self.work.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_filter_adaptation_edges_by_screen_work(self):
        """Test filtering edges by screen work."""
        response = self.client.get(f'/api/screen/adaptations/?screen_work={self.movie.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_adaptation_edges_are_read_only(self):
        """Test that adaptation edges API is read-only."""
        response = self.client.post('/api/screen/adaptations/', {
            'work': self.work.id,
            'screen_work': self.movie.id
        })
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
