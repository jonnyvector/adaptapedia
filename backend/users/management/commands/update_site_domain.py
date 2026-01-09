"""Management command to update Django Site domain for OAuth."""
import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site


class Command(BaseCommand):
    help = 'Update Django Site domain for OAuth redirects'

    def handle(self, *args, **options):
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')
        # Remove protocol for domain
        domain = backend_url.replace('https://', '').replace('http://', '')

        try:
            site = Site.objects.get(id=1)
            old_domain = site.domain
            site.domain = domain
            site.name = 'Adaptapedia'
            site.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully updated Site domain from "{old_domain}" to "{domain}"'
                )
            )
        except Site.DoesNotExist:
            site = Site.objects.create(id=1, domain=domain, name='Adaptapedia')
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created Site with domain "{domain}"'
                )
            )
