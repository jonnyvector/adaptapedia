"""Replace Open Library covers with better Google Books covers."""
from django.core.management.base import BaseCommand
from works.models import Work
from works.utils.google_books import search_book


class Command(BaseCommand):
    help = 'Replace Open Library covers with Google Books covers'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without saving',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of books to process',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run')
        limit = options.get('limit')

        # Find all books with Open Library covers
        works = Work.objects.filter(cover_url__icontains='openlibrary.org')

        if limit:
            works = works[:limit]

        total = works.count()
        self.stdout.write(f'Found {total} books with Open Library covers\n')

        stats = {
            'processed': 0,
            'replaced': 0,
            'not_found': 0,
            'errors': 0,
        }

        for i, work in enumerate(works, 1):
            stats['processed'] += 1

            old_cover = work.cover_url
            self.stdout.write(f'\n[{i}/{total}] {work.title}')
            self.stdout.write(f'  Current (Open Library): {old_cover[:80]}...')

            try:
                # Search Google Books
                self.stdout.write(f'  → Searching Google Books...')
                google_data = search_book(work.title, work.author)

                if google_data and google_data.get('cover_url'):
                    new_cover = google_data['cover_url']

                    if dry_run:
                        self.stdout.write(self.style.SUCCESS(
                            f'  ✓ Would replace with: {new_cover[:80]}...'
                        ))
                    else:
                        work.cover_url = new_cover
                        work.save(update_fields=['cover_url'])
                        self.stdout.write(self.style.SUCCESS(
                            f'  ✓ Replaced with Google Books cover'
                        ))

                    stats['replaced'] += 1
                else:
                    self.stdout.write(self.style.WARNING(
                        f'  ✗ No Google Books cover found, keeping Open Library'
                    ))
                    stats['not_found'] += 1

            except Exception as e:
                stats['errors'] += 1
                self.stdout.write(self.style.ERROR(f'  ✗ Error: {str(e)}'))

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(f'  Processed: {stats["processed"]}')
        self.stdout.write(self.style.SUCCESS(f'  Replaced: {stats["replaced"]}'))
        self.stdout.write(f'  Not found: {stats["not_found"]}')
        if stats['errors'] > 0:
            self.stdout.write(self.style.WARNING(f'  Errors: {stats["errors"]}'))

        if dry_run:
            self.stdout.write('\n' + self.style.WARNING('DRY RUN - No changes saved'))
        else:
            self.stdout.write('\n' + self.style.SUCCESS('Cover replacement complete!'))

        self.stdout.write('=' * 70)
