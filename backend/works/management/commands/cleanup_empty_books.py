"""Management command to remove books with no cover and no adaptations."""
from django.core.management.base import BaseCommand
from works.models import Work
from screen.models import AdaptationEdge


class Command(BaseCommand):
    help = 'Remove books that have no cover image and no adaptations (dry-run by default)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Actually delete the books (default is dry-run)',
        )

    def handle(self, *args, **options):
        delete = options.get('delete')

        # Find books with no cover AND no adaptations
        books_to_remove = []

        for work in Work.objects.all():
            has_cover = bool(work.cover_url and work.cover_url.strip())
            has_adaptations = AdaptationEdge.objects.filter(work=work).exists()

            # Only remove if BOTH conditions are true:
            # 1. No cover image
            # 2. No adaptations
            if not has_cover and not has_adaptations:
                books_to_remove.append(work)

        if not books_to_remove:
            self.stdout.write(self.style.SUCCESS('No books to remove!'))
            return

        self.stdout.write(f'\nFound {len(books_to_remove)} books with no cover AND no adaptations:')
        self.stdout.write('-' * 80)

        for work in books_to_remove[:20]:  # Show first 20
            self.stdout.write(f'  ID {work.id}: {work.title} (year: {work.year or "unknown"})')

        if len(books_to_remove) > 20:
            self.stdout.write(f'  ... and {len(books_to_remove) - 20} more')

        self.stdout.write('-' * 80)

        if delete:
            confirm = input(f'\nAre you SURE you want to delete {len(books_to_remove)} books? Type "DELETE" to confirm: ')

            if confirm == 'DELETE':
                count = 0
                for work in books_to_remove:
                    work.delete()
                    count += 1

                self.stdout.write(self.style.SUCCESS(f'\nDeleted {count} books'))
            else:
                self.stdout.write(self.style.WARNING('Deletion cancelled'))
        else:
            self.stdout.write(self.style.WARNING('\nThis is a DRY RUN. No books were deleted.'))
            self.stdout.write(self.style.WARNING('To actually delete these books, run:'))
            self.stdout.write(self.style.WARNING('  python manage.py cleanup_empty_books --delete'))
