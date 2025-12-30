"""Management command to add book covers."""
from django.core.management.base import BaseCommand
from works.models import Work


class Command(BaseCommand):
    """Add or update a book cover URL."""

    help = 'Add or update a book cover URL'

    def add_arguments(self, parser):
        parser.add_argument('book_id', type=int, help='Book ID')
        parser.add_argument('cover_url', type=str, help='Cover image URL')

    def handle(self, *args, **options):
        book_id = options['book_id']
        cover_url = options['cover_url']

        try:
            book = Work.objects.get(id=book_id)
            book.cover_url = cover_url
            book.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Updated cover for "{book.title}" ({book.year})\n'
                    f'  URL: {cover_url}'
                )
            )
        except Work.DoesNotExist:
            self.stderr.write(
                self.style.ERROR(f'Book with ID {book_id} not found')
            )
