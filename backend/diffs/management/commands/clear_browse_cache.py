"""Management command to clear browse page cache."""
from django.core.management.base import BaseCommand
from django.core.cache import cache


class Command(BaseCommand):
    help = 'Clear browse page cache to refresh data'

    def handle(self, *args, **options):
        try:
            # Clear browse page cache
            cache.delete('browse_page_sections')

            # Clear needs_help cache variants
            for limit in [10, 20, 30, 40, 50]:
                cache.delete(f'needs_help_limit_{limit}')

            self.stdout.write(
                self.style.SUCCESS('Successfully cleared browse page cache')
            )
        except Exception as e:
            # Don't fail deployment if cache clear fails
            self.stdout.write(
                self.style.WARNING(f'Failed to clear cache (non-fatal): {e}')
            )
