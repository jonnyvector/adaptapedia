"""WSGI config for Adaptapedia."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.production')

application = get_wsgi_application()
