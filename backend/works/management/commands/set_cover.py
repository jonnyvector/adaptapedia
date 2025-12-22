"""Set cover URL manually for a book."""
from django.core.management.base import BaseCommand
from works.models import Work


class Command(BaseCommand):
    help = 'Manually set cover URL for a book'

    def add_arguments(self, parser):
        parser.add_argument(
            '--id',
            type=int,
            required=True,
            help='Work ID',
        )
        parser.add_argument(
            '--url',
            type=str,
            required=True,
            help='Cover image URL',
        )

    def handle(self, *args, **options):
        work_id = options['id']
        cover_url = options['url']

        try:
            work = Work.objects.get(id=work_id)
            old_url = work.cover_url or '(none)'
            work.cover_url = cover_url
            work.save(update_fields=['cover_url'])

            self.stdout.write(self.style.SUCCESS(f'✓ Updated cover for "{work.title}"'))
            self.stdout.write(f'  Old: {old_url[:80]}...')
            self.stdout.write(f'  New: {cover_url[:80]}...')

        except Work.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Work with ID {work_id} not found'))
