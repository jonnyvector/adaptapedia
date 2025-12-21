# Celery Beat Periodic Tasks Setup

This document describes the Celery Beat periodic task scheduler configuration for Adaptapedia.

## Overview

Celery Beat has been configured to run periodic tasks for:
- Daily Wikidata ingestion
- Weekly TMDb metadata refresh
- Daily site statistics updates
- Maintenance tasks (session cleanup, JWT token cleanup)
- Health checks

## Scheduled Tasks

### 1. Daily Wikidata Ingestion
- **Task:** `ingestion.tasks.run_daily_wikidata_ingestion`
- **Schedule:** Daily at 2:00 AM UTC
- **Purpose:** Fetch new book-to-screen adaptation relationships from Wikidata
- **Output:** Creates/updates Works, ScreenWorks, and AdaptationEdges

### 2. Weekly TMDb Metadata Refresh
- **Task:** `ingestion.tasks.refresh_tmdb_metadata`
- **Schedule:** Every Sunday at 3:00 AM UTC
- **Purpose:** Enrich screen works with TMDb data (posters, summaries, years)
- **Limits:** Processes up to 100 screen works per run to avoid API rate limits

### 3. Daily Statistics Update
- **Task:** `ingestion.tasks.update_site_statistics`
- **Schedule:** Daily at 1:00 AM UTC
- **Purpose:** Calculate and cache site-wide statistics for dashboards
- **Cached Data:**
  - Total works, screen works, adaptations, diffs, users
  - Active users (last 30 days)
  - Works by type (movies vs TV series)

### 4. Daily Session Cleanup
- **Task:** `ingestion.tasks.cleanup_expired_sessions`
- **Schedule:** Daily at 4:00 AM UTC
- **Purpose:** Remove expired Django sessions from database

### 5. Weekly JWT Token Cleanup
- **Task:** `ingestion.tasks.cleanup_expired_jwt_tokens`
- **Schedule:** Every Monday at 5:00 AM UTC
- **Purpose:** Clean up expired JWT tokens (30+ days old) from blacklist

### 6. Hourly Health Check
- **Task:** `ingestion.tasks.health_check`
- **Schedule:** Every hour on the hour
- **Purpose:** Verify Celery worker is responsive

## Setup Instructions

### 1. Ensure Services Are Running

```bash
docker-compose up -d db redis backend worker beat
```

### 2. Run Database Migrations

The django-celery-beat package requires database tables:

```bash
docker-compose exec backend python manage.py migrate django_celery_beat
```

### 3. Sync Periodic Tasks to Database

Run the management command to sync tasks from settings to the database:

```bash
docker-compose exec backend python manage.py setup_periodic_tasks
```

This command reads `CELERY_BEAT_SCHEDULE` from settings and creates corresponding database records.

### 4. Verify Beat Service Is Running

Check the logs:

```bash
docker-compose logs -f beat
```

You should see:
```
celery beat v5.3.6 is starting.
DatabaseScheduler: Schedule changed.
```

## Testing Tasks

### Manual Task Execution

You can run any task immediately without waiting for the schedule:

```bash
# Enter Django shell
docker-compose exec backend python manage.py shell

# Run a task synchronously (blocking)
from ingestion.tasks import run_daily_wikidata_ingestion
result = run_daily_wikidata_ingestion()
print(result)

# Run a task asynchronously (non-blocking)
from ingestion.tasks import refresh_tmdb_metadata
async_result = refresh_tmdb_metadata.delay()
print(async_result.get())  # Wait for result
```

### Testing via Django Admin

1. Navigate to http://localhost:8000/admin/
2. Log in with superuser credentials
3. Go to **Django Celery Beat** section:
   - **Periodic tasks**: View/edit scheduled tasks
   - **Crontab schedules**: View/edit cron schedules
   - **Clocked schedules**: One-time scheduled tasks

### Triggering a Task via Admin

1. Go to **Periodic tasks**
2. Find the task you want to run
3. Click on it
4. Click "Run task now" (if available) or temporarily change the schedule

### Using Celery CLI

```bash
# Inspect scheduled tasks
docker-compose exec worker celery -A adaptapedia inspect scheduled

# Inspect active tasks
docker-compose exec worker celery -A adaptapedia inspect active

# Call a task directly
docker-compose exec worker celery -A adaptapedia call ingestion.tasks.health_check
```

## Monitoring Tasks

### View Beat Logs

```bash
docker-compose logs -f beat
```

### View Worker Logs

```bash
docker-compose logs -f worker
```

### Check Task Results

Task results are stored in Redis and expire after 1 hour (configurable via `CELERY_RESULT_EXPIRES`).

```bash
# Enter Django shell
docker-compose exec backend python manage.py shell

# Check cached statistics
from django.core.cache import cache
stats = cache.get('site_statistics')
print(stats)

wikidata_stats = cache.get('last_wikidata_ingestion')
print(wikidata_stats)

tmdb_stats = cache.get('last_tmdb_refresh')
print(tmdb_stats)
```

### Using Flower (Optional)

Flower is a real-time Celery monitoring tool. To add it:

1. Add to `docker-compose.yml`:
```yaml
flower:
  image: mher/flower
  command: celery --broker=redis://redis:6379/0 flower
  ports:
    - "5555:5555"
  depends_on:
    - redis
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
    - CELERY_RESULT_BACKEND=redis://redis:6379/0
```

2. Start Flower:
```bash
docker-compose up -d flower
```

3. Access at http://localhost:5555

## Configuration Details

### Settings-Based Schedule (Current)

Schedules are defined in `/backend/adaptapedia/settings/base.py`:

```python
CELERY_BEAT_SCHEDULE = {
    'daily-wikidata-ingestion': {
        'task': 'ingestion.tasks.run_daily_wikidata_ingestion',
        'schedule': crontab(hour=2, minute=0),
    },
    # ... more tasks
}
```

### Database Scheduler

The beat service uses `DatabaseScheduler` which:
- Stores schedules in PostgreSQL
- Allows dynamic schedule updates via Django admin
- Syncs with settings via `setup_periodic_tasks` command

To use settings-only (no database):
1. Remove `--scheduler django_celery_beat.schedulers:DatabaseScheduler` from docker-compose.yml
2. Beat will use in-memory schedules from settings

## Task Error Handling

### Retry Logic

Tasks with `bind=True` and `max_retries` will automatically retry on failure:

```python
@shared_task(bind=True, max_retries=3)
def my_task(self):
    try:
        # Task logic
    except Exception as exc:
        # Retry after 1 hour
        raise self.retry(exc=exc, countdown=3600)
```

### Logging

All tasks log to Django's logging system:

```bash
# View all logs
docker-compose logs -f backend worker beat

# View only errors
docker-compose logs -f backend worker beat | grep ERROR
```

## Troubleshooting

### Beat Not Starting

**Symptom:** Beat service exits immediately

**Solution:**
1. Check migrations: `docker-compose exec backend python manage.py migrate`
2. Check beat logs: `docker-compose logs beat`
3. Verify Redis is running: `docker-compose ps redis`

### Tasks Not Executing

**Symptom:** Tasks are scheduled but never run

**Checklist:**
- [ ] Worker service is running: `docker-compose ps worker`
- [ ] Beat service is running: `docker-compose ps beat`
- [ ] Redis is accessible: `docker-compose exec backend redis-cli -h redis ping`
- [ ] Tasks are enabled in admin: http://localhost:8000/admin/django_celery_beat/periodictask/
- [ ] Check worker logs for errors: `docker-compose logs worker`

### Database Locked Errors

**Symptom:** `OperationalError: database is locked`

**Solution:**
Beat and worker should use PostgreSQL, not SQLite. Verify `DB_HOST=db` in docker-compose.yml.

### Task Timing Issues

**Symptom:** Tasks run at unexpected times

**Note:** All schedules use UTC timezone. Verify with:

```python
from django.conf import settings
print(settings.TIME_ZONE)  # Should be 'UTC'
```

## Maintenance

### Updating Schedules

**Option 1: Via Settings (Recommended)**
1. Edit `/backend/adaptapedia/settings/base.py`
2. Update `CELERY_BEAT_SCHEDULE`
3. Run: `docker-compose exec backend python manage.py setup_periodic_tasks`
4. Restart beat: `docker-compose restart beat`

**Option 2: Via Django Admin**
1. Go to http://localhost:8000/admin/django_celery_beat/periodictask/
2. Edit task schedule directly
3. Changes take effect within 1 minute (beat refresh interval)

### Adding New Tasks

1. Create task in `ingestion/tasks.py`:
```python
@shared_task
def my_new_task():
    # Task logic
    pass
```

2. Add to `CELERY_BEAT_SCHEDULE` in settings:
```python
'my-scheduled-task': {
    'task': 'ingestion.tasks.my_new_task',
    'schedule': crontab(hour=6, minute=30),
}
```

3. Sync to database:
```bash
docker-compose exec backend python manage.py setup_periodic_tasks
```

### Disabling Tasks

**Temporarily:**
```bash
# Via admin - uncheck "Enabled" checkbox
# Or via shell:
from django_celery_beat.models import PeriodicTask
task = PeriodicTask.objects.get(name='daily-wikidata-ingestion')
task.enabled = False
task.save()
```

**Permanently:**
Remove from `CELERY_BEAT_SCHEDULE` and run `setup_periodic_tasks`.

## Production Considerations

### Scaling

- Run only ONE beat instance (multiple beats = duplicate tasks)
- Run multiple workers for parallel task execution
- Use Redis or RabbitMQ with persistence

### Monitoring

- Set up error alerting (Sentry, email notifications)
- Monitor task execution times
- Track task failure rates
- Set up Flower or similar monitoring tool

### Backup

- Database contains task schedules - include in backups
- Celery results are ephemeral (stored in Redis)

### Security

- Limit admin access to django-celery-beat models
- Use strong Redis password in production
- Consider task result encryption for sensitive data

## Files Modified/Created

### Created:
- `/backend/ingestion/tasks.py` - All periodic tasks
- `/backend/ingestion/management/commands/setup_periodic_tasks.py` - Sync command
- `/backend/ingestion/management/__init__.py`
- `/backend/ingestion/management/commands/__init__.py`
- `/backend/ingestion/CELERY_BEAT_SETUP.md` - This file

### Modified:
- `/backend/adaptapedia/settings/base.py` - Added `CELERY_BEAT_SCHEDULE`
- `/docker-compose.yml` - Updated beat service to use DatabaseScheduler
