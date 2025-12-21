"""Management command to sync periodic tasks from settings to database."""
from django.core.management.base import BaseCommand
from django.conf import settings
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json


class Command(BaseCommand):
    """Sync Celery Beat schedule from settings to database."""

    help = 'Sync periodic tasks from CELERY_BEAT_SCHEDULE settings to database'

    def handle(self, *args, **options):
        """Execute the command."""
        self.stdout.write('Syncing periodic tasks to database...')

        beat_schedule = getattr(settings, 'CELERY_BEAT_SCHEDULE', {})

        if not beat_schedule:
            self.stdout.write(
                self.style.WARNING('No CELERY_BEAT_SCHEDULE found in settings')
            )
            return

        created_count = 0
        updated_count = 0

        for task_name, task_config in beat_schedule.items():
            # Get or create crontab schedule
            schedule = task_config['schedule']

            if hasattr(schedule, 'minute'):
                # It's a crontab schedule
                crontab_schedule, _ = CrontabSchedule.objects.get_or_create(
                    minute=schedule._orig_minute,
                    hour=schedule._orig_hour,
                    day_of_week=schedule._orig_day_of_week,
                    day_of_month=schedule._orig_day_of_month,
                    month_of_year=schedule._orig_month_of_year,
                )

                # Get or create periodic task
                task, created = PeriodicTask.objects.get_or_create(
                    name=task_name,
                    defaults={
                        'task': task_config['task'],
                        'crontab': crontab_schedule,
                        'enabled': True,
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created task: {task_name}')
                    )
                else:
                    # Update existing task
                    task.task = task_config['task']
                    task.crontab = crontab_schedule
                    task.enabled = True

                    # Update task options if provided
                    if 'options' in task_config:
                        task.kwargs = json.dumps(task_config['options'])

                    task.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Updated task: {task_name}')
                    )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        f'Skipping {task_name}: only crontab schedules supported'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSync complete: {created_count} created, {updated_count} updated'
            )
        )
