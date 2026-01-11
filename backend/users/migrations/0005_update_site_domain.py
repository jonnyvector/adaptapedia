# Generated manually to fix OAuth redirect URLs

import os
from django.db import migrations


def update_site_domain(apps, schema_editor):
    """Update Django Site domain to match production backend URL."""
    Site = apps.get_model('sites', 'Site')

    # Get backend URL from environment, fallback to localhost for development
    backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')
    # Remove protocol for domain
    domain = backend_url.replace('https://', '').replace('http://', '')

    try:
        site = Site.objects.get(id=1)
        site.domain = domain
        site.name = 'Adaptapedia'
        site.save()
        print(f'Updated Site domain to: {domain}')
    except Site.DoesNotExist:
        Site.objects.create(id=1, domain=domain, name='Adaptapedia')
        print(f'Created Site with domain: {domain}')


def reverse_update(apps, schema_editor):
    """Reverse operation - set back to localhost."""
    Site = apps.get_model('sites', 'Site')
    try:
        site = Site.objects.get(id=1)
        site.domain = 'localhost:8000'
        site.save()
    except Site.DoesNotExist:
        pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_userpreferences_user_onboarding_completed_and_more'),
        ('sites', '0002_alter_domain_unique'),  # Ensure sites app is migrated
    ]

    operations = [
        migrations.RunPython(update_site_domain, reverse_update),
    ]
