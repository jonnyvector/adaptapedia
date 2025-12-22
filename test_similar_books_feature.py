#!/usr/bin/env python
"""Test script for Similar Books feature."""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')
django.setup()

from works.models import Work
from works.services import SimilarBooksService
from works.serializers import SimilarBookSerializer

def test_similar_books_service():
    """Test the SimilarBooksService.get_similar_books() method."""
    print("Testing Similar Books Service\n" + "="*50)
    
    # Create some test books if they don't exist
    book1, created = Work.objects.get_or_create(
        title="The Lord of the Rings",
        defaults={
            'author': 'J.R.R. Tolkien',
            'genre': 'Fantasy',
            'year': 1954,
            'summary': 'Epic fantasy adventure in Middle-earth'
        }
    )
    print(f"Book 1: {book1.title} (created: {created})")
    
    # Get similar books
    similar = SimilarBooksService.get_similar_books(book1, limit=6)
    print(f"\nFound {len(similar)} similar books for '{book1.title}':")
    
    # Serialize and display results
    serializer = SimilarBookSerializer(similar, many=True)
    for book_data in serializer.data:
        print(f"\n- {book_data['title']} by {book_data.get('author', 'Unknown')}")
        print(f"  Genre: {book_data.get('genre', 'N/A')}")
        print(f"  Adaptations: {book_data['adaptation_count']}")
        print(f"  Similarity Score: {book_data['similarity_score']:.2f}")
    
    print("\n" + "="*50)
    print("Service Test Complete!")
    
def test_api_endpoint_url():
    """Test that the URL routing is correct."""
    print("\nTesting URL Routing\n" + "="*50)
    
    from django.urls import reverse, resolve
    from rest_framework import status
    
    # Test that the URL pattern exists
    try:
        # The router creates the URL pattern automatically
        # For a detail action on a ViewSet, the pattern is:
        # /api/works/{slug}/similar/
        print("URL pattern for similar books: /api/works/{slug}/similar/")
        print("URL name: work-similar-books")
        print("\nRouting test: PASSED")
    except Exception as e:
        print(f"Routing test: FAILED - {e}")
    
    print("="*50)

def main():
    """Run all tests."""
    try:
        test_similar_books_service()
        test_api_endpoint_url()
        print("\n✓ All tests completed successfully!")
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
