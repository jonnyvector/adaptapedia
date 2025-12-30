"""Management command to fetch book data from Google Books API."""
from django.core.management.base import BaseCommand
from works.models import Work
from works.utils.google_books import search_book


class Command(BaseCommand):
    help = 'Fetch book metadata from Google Books API and update Work records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--id',
            type=int,
            help='Update a specific work by ID',
        )
        parser.add_argument(
            '--title',
            type=str,
            help='Search for a book by title',
        )
        parser.add_argument(
            '--author',
            type=str,
            help='Author name to narrow search (use with --title)',
        )
        parser.add_argument(
            '--all-missing',
            action='store_true',
            help='Update all works missing cover URLs',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without saving',
        )

    def handle(self, *args, **options):
        work_id = options.get('id')
        title = options.get('title')
        author = options.get('author')
        all_missing = options.get('all_missing')
        dry_run = options.get('dry_run')

        if work_id:
            # Update specific work
            try:
                work = Work.objects.get(id=work_id)
                self.update_work(work, dry_run=dry_run)
            except Work.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Work with ID {work_id} not found'))

        elif title:
            # Search and create/update work
            self.search_and_display(title, author, dry_run=dry_run)

        elif all_missing:
            # Update all works missing covers
            works = Work.objects.filter(cover_url__isnull=True) | Work.objects.filter(cover_url='')
            total = works.count()
            self.stdout.write(f'Found {total} works missing cover URLs')

            for i, work in enumerate(works, 1):
                self.stdout.write(f'\n[{i}/{total}] Processing: {work.title}')
                self.update_work(work, dry_run=dry_run)

        else:
            self.stdout.write(self.style.ERROR(
                'Please specify --id, --title, or --all-missing'
            ))

    def search_and_display(self, title, author=None, dry_run=False):
        """Search Google Books and display/update results."""
        self.stdout.write(f'Searching for: {title}')
        if author:
            self.stdout.write(f'By author: {author}')

        book_data = search_book(title, author)

        if not book_data:
            self.stdout.write(self.style.WARNING('No results found'))
            return

        self.stdout.write(self.style.SUCCESS('\nFound book:'))
        self.stdout.write(f"  Title: {book_data.get('title')}")
        self.stdout.write(f"  Author: {book_data.get('author')}")
        self.stdout.write(f"  Year: {book_data.get('year')}")
        self.stdout.write(f"  Publisher: {book_data.get('publisher')}")
        self.stdout.write(f"  Cover URL: {book_data.get('cover_url')}")
        self.stdout.write(f"  Description: {book_data.get('description', '')[:100]}...")

        if not dry_run:
            # Try to find existing work or create new one
            work, created = Work.objects.get_or_create(
                title=book_data['title'],
                defaults={
                    'summary': book_data.get('description', ''),
                    'year': book_data.get('year'),
                    'language': book_data.get('language'),
                    'cover_url': book_data.get('cover_url'),
                }
            )

            if not created:
                # Update existing work
                work.cover_url = book_data.get('cover_url')
                work.summary = book_data.get('description', '') or work.summary
                work.year = book_data.get('year') or work.year
                work.save()
                self.stdout.write(self.style.SUCCESS(f'\nUpdated work ID: {work.id}'))
            else:
                self.stdout.write(self.style.SUCCESS(f'\nCreated new work ID: {work.id}'))

    def update_work(self, work, dry_run=False):
        """Update an existing work with Google Books data."""
        book_data = search_book(work.title, work.author if work.author else None)

        if not book_data:
            self.stdout.write(self.style.WARNING(f'  No Google Books data found for: {work.title}'))
            return

        self.stdout.write(self.style.SUCCESS(f'  Found: {book_data.get("title")} by {book_data.get("author")}'))

        if dry_run:
            self.stdout.write('  Would update:')
            if book_data.get('cover_url'):
                self.stdout.write(f"    Cover URL: {book_data['cover_url']}")
            if book_data.get('author') and not work.author:
                self.stdout.write(f"    Author: {book_data['author']}")
            if book_data.get('description') and not work.summary:
                self.stdout.write(f"    Summary: {book_data['description'][:50]}...")
            if book_data.get('year') and not work.year:
                self.stdout.write(f"    Year: {book_data['year']}")
            if book_data.get('genre') and not work.genre:
                self.stdout.write(f"    Genre: {book_data['genre']}")
            if book_data.get('language') and not work.language:
                self.stdout.write(f"    Language: {book_data['language']}")
            if book_data.get('average_rating'):
                self.stdout.write(f"    Rating: {book_data['average_rating']} ({book_data.get('ratings_count', 0)} ratings)")
        else:
            updated = False

            if book_data.get('cover_url'):
                work.cover_url = book_data['cover_url']
                updated = True

            if book_data.get('author') and not work.author:
                work.author = book_data['author']
                updated = True

            if book_data.get('description') and not work.summary:
                work.summary = book_data['description']
                updated = True

            if book_data.get('year') and not work.year:
                work.year = book_data['year']
                updated = True

            if book_data.get('genre') and not work.genre:
                work.genre = book_data['genre']
                updated = True

            if book_data.get('language') and not work.language:
                work.language = book_data['language']
                updated = True

            if book_data.get('average_rating'):
                work.average_rating = book_data['average_rating']
                updated = True

            if book_data.get('ratings_count'):
                work.ratings_count = book_data['ratings_count']
                updated = True

            if updated:
                work.save()
                self.stdout.write(self.style.SUCCESS(f'  Updated work ID: {work.id}'))
            else:
                self.stdout.write('  No updates needed')
