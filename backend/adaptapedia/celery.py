"""Celery configuration for Adaptapedia."""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')

app = Celery('adaptapedia')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self) -> str:
    """Debug task for testing Celery."""
    return f'Request: {self.request!r}'
