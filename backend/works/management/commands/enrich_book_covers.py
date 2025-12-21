"""Management command to enrich books with cover images from various APIs."""
from django.core.management.base import BaseCommand
from works.models import Work
from works.utils.google_books import search_book
from works.utils.openlibrary_covers import get_cover_by_title


class Command(BaseCommand):
    help = 'Enrich book records with cover images from Google Books and Open Library'

    def add_arguments(self, parser):
        parser.add_argument(
            '--id',
            type=int,
            help='Update a specific work by ID',
        )
        parser.add_argument(
            '--all-missing',
            action='store_true',
            help='Update all works missing cover URLs',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of books to process',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without saving',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Update books even if they already have covers',
        )

    def handle(self, *args, **options):
        work_id = options.get('id')
        all_missing = options.get('all_missing')
        limit = options.get('limit')
        dry_run = options.get('dry_run')
        force = options.get('force')

        stats = {
            'processed': 0,
            'updated_google': 0,
            'updated_openlibrary': 0,
            'no_cover_found': 0,
            'skipped': 0,
            'errors': 0,
        }

        if work_id:
            # Update specific work
            try:
                work = Work.objects.get(id=work_id)
                self.process_work(work, dry_run=dry_run, force=force, stats=stats)
            except Work.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Work with ID {work_id} not found'))

        elif all_missing or force:
            # Update works missing covers (or all if force)
            if force:
                works = Work.objects.all()
                self.stdout.write(f'Processing all works (force mode)...')
            else:
                works = Work.objects.filter(cover_url='') | Work.objects.filter(cover_url__isnull=True)
                self.stdout.write(f'Found {works.count()} works missing cover URLs')

            if limit:
                works = works[:limit]
                self.stdout.write(f'Limited to {limit} works')

            total = works.count()

            for i, work in enumerate(works, 1):
                self.stdout.write(f'\n[{i}/{total}] Processing: {work.title}')
                self.process_work(work, dry_run=dry_run, force=force, stats=stats)

        else:
            self.stdout.write(self.style.ERROR(
                'Please specify --id, --all-missing, or --force'
            ))
            return

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('Summary:'))
        self.stdout.write(f'  Processed: {stats["processed"]}')
        self.stdout.write(f'  Updated (Google Books): {stats["updated_google"]}')
        self.stdout.write(f'  Updated (Open Library): {stats["updated_openlibrary"]}')
        self.stdout.write(f'  No cover found: {stats["no_cover_found"]}')
        self.stdout.write(f'  Skipped: {stats["skipped"]}')
        if stats['errors'] > 0:
            self.stdout.write(self.style.WARNING(f'  Errors: {stats["errors"]}'))
        self.stdout.write('=' * 70)

    def process_work(self, work, dry_run=False, force=False, stats=None):
        """Process a single work to fetch and update cover image."""
        if stats is None:
            stats = {}

        stats['processed'] = stats.get('processed', 0) + 1

        # Skip if already has cover and not forcing
        if work.cover_url and not force:
            self.stdout.write(f'  ⊘ Already has cover, skipping')
            stats['skipped'] = stats.get('skipped', 0) + 1
            return

        try:
            cover_url = None
            source = None

            # Try Google Books API first
            self.stdout.write(f'  → Searching Google Books...')
            google_data = search_book(work.title)

            if google_data and google_data.get('cover_url'):
                cover_url = google_data['cover_url']
                source = 'Google Books'
                stats['updated_google'] = stats.get('updated_google', 0) + 1

                # Also update other metadata if available
                if not work.summary and google_data.get('description'):
                    if dry_run:
                        self.stdout.write(f'    Would also update summary')
                    else:
                        work.summary = google_data['description']

                if not work.year and google_data.get('year'):
                    if dry_run:
                        self.stdout.write(f'    Would also update year: {google_data["year"]}')
                    else:
                        work.year = google_data['year']

                if not work.author and google_data.get('author'):
                    if dry_run:
                        self.stdout.write(f'    Would also update author: {google_data["author"]}')
                    else:
                        work.author = google_data['author']

                if not work.genre and google_data.get('genre'):
                    if dry_run:
                        self.stdout.write(f'    Would also update genre: {google_data["genre"]}')
                    else:
                        work.genre = google_data['genre']

            # Fall back to Open Library if Google Books didn't find a cover
            if not cover_url:
                self.stdout.write(f'  → Searching Open Library...')
                ol_cover = get_cover_by_title(work.title)

                if ol_cover:
                    cover_url = ol_cover
                    source = 'Open Library'
                    stats['updated_openlibrary'] = stats.get('updated_openlibrary', 0) + 1

            # Update the work
            if cover_url:
                if dry_run:
                    self.stdout.write(self.style.SUCCESS(
                        f'  ✓ Would update cover from {source}: {cover_url[:60]}...'
                    ))
                else:
                    work.cover_url = cover_url
                    work.save()
                    self.stdout.write(self.style.SUCCESS(
                        f'  ✓ Updated cover from {source}'
                    ))
            else:
                self.stdout.write(self.style.WARNING(f'  ✗ No cover found'))
                stats['no_cover_found'] = stats.get('no_cover_found', 0) + 1

        except Exception as e:
            stats['errors'] = stats.get('errors', 0) + 1
            self.stdout.write(self.style.ERROR(f'  ✗ Error: {str(e)}'))
