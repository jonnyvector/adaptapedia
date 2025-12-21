# Celery Beat Testing Guide

This guide shows you how to verify that all periodic tasks are working correctly.

## Quick Verification Checklist

### 1. Verify Services Are Running

```bash
docker-compose ps
```

Expected output: `backend`, `worker`, `beat`, `db`, `redis` should all be "Up".

### 2. Check Beat is Using DatabaseScheduler

```bash
docker-compose logs beat | grep scheduler
```

Expected output:
```
. scheduler -> django_celery_beat.schedulers.DatabaseScheduler
```

### 3. Verify Tasks Are Registered

```bash
docker-compose logs worker | grep "ingestion.tasks"
```

Expected output should list all tasks:
- `ingestion.tasks.run_daily_wikidata_ingestion`
- `ingestion.tasks.refresh_tmdb_metadata`
- `ingestion.tasks.update_site_statistics`
- `ingestion.tasks.cleanup_expired_sessions`
- `ingestion.tasks.cleanup_expired_jwt_tokens`
- `ingestion.tasks.health_check`

### 4. Verify Scheduled Tasks in Database

```bash
docker-compose exec backend python manage.py shell -c "
from django_celery_beat.models import PeriodicTask
print(f'Scheduled tasks: {PeriodicTask.objects.count()}')
for task in PeriodicTask.objects.filter(task__startswith='ingestion'):
    print(f'  - {task.name}: {task.enabled}')
"
```

## Manual Task Testing

### Test 1: Health Check Task

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.tasks import health_check

# Run asynchronously
result = health_check.delay()
print(f"Task ID: {result.id}")

# Wait for result
import time
time.sleep(2)
print(result.get(timeout=5))
# Expected: {'status': 'healthy', 'task_id': '...', 'timestamp': '...'}
```

### Test 2: Site Statistics Update

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.tasks import update_site_statistics
from django.core.cache import cache

# Run task
result = update_site_statistics.delay()
time.sleep(2)
stats = result.get(timeout=10)
print(stats)
# Expected: Dict with total_works, total_screen_works, etc.

# Verify it's cached
cached = cache.get('site_statistics')
print(f"Cached: {cached is not None}")
```

### Test 3: Wikidata Ingestion (Read-Only Test)

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.wikidata import ingest_wikidata_pairs

# This actually creates records, so be careful in production
result = ingest_wikidata_pairs.delay()
time.sleep(5)
stats = result.get(timeout=30)
print(stats)
# Expected: {'works_created': X, 'screen_works_created': Y, ...}
```

### Test 4: TMDb Metadata Refresh

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.tasks import refresh_tmdb_metadata

# This will attempt to enrich screen works
result = refresh_tmdb_metadata.delay()
time.sleep(5)
stats = result.get(timeout=60)
print(stats)
# Expected: {'status': 'success', 'processed': X, 'enriched': Y, ...}
```

### Test 5: Session Cleanup

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.tasks import cleanup_expired_sessions

result = cleanup_expired_sessions.delay()
time.sleep(2)
stats = result.get(timeout=10)
print(stats)
# Expected: {'status': 'success', 'deleted_count': X, ...}
```

### Test 6: JWT Token Cleanup

```bash
docker-compose exec backend python manage.py shell
```

```python
from ingestion.tasks import cleanup_expired_jwt_tokens

result = cleanup_expired_jwt_tokens.delay()
time.sleep(2)
stats = result.get(timeout=10)
print(stats)
# Expected: {'status': 'success', 'outstanding_deleted': X, ...}
```

## Monitoring Scheduled Execution

### View Beat Schedule

```bash
docker-compose exec backend python manage.py shell
```

```python
from django_celery_beat.models import PeriodicTask, CrontabSchedule

for task in PeriodicTask.objects.filter(enabled=True):
    print(f"\n{task.name}")
    print(f"  Task: {task.task}")
    print(f"  Schedule: {task.crontab}")
    print(f"  Last run: {task.last_run_at}")
    print(f"  Total run count: {task.total_run_count}")
```

### Watch Task Execution in Real-Time

In one terminal:
```bash
docker-compose logs -f worker
```

In another terminal:
```bash
docker-compose logs -f beat
```

### Manually Trigger a Scheduled Task

Via Django admin:
1. Go to http://localhost:8000/admin/django_celery_beat/periodictask/
2. Click on a task
3. Temporarily change its schedule to run in the next minute
4. Watch the logs

Or via shell:
```bash
docker-compose exec backend python manage.py shell
```

```python
from django_celery_beat.models import PeriodicTask

# Find the task
task = PeriodicTask.objects.get(name='daily-stats-update')

# Trigger it immediately by calling the task directly
from ingestion.tasks import update_site_statistics
result = update_site_statistics.delay()
print(result.get(timeout=10))
```

## Verifying Task Results

### Check Cached Results

```bash
docker-compose exec backend python manage.py shell
```

```python
from django.core.cache import cache

# Check various cached results
print("Site Statistics:", cache.get('site_statistics'))
print("\nLast Wikidata Ingestion:", cache.get('last_wikidata_ingestion'))
print("\nLast TMDb Refresh:", cache.get('last_tmdb_refresh'))
```

### Check Task Execution History

```bash
docker-compose exec backend python manage.py shell
```

```python
from django_celery_beat.models import PeriodicTask

for task in PeriodicTask.objects.filter(task__startswith='ingestion'):
    print(f"\n{task.name}")
    print(f"  Total runs: {task.total_run_count}")
    print(f"  Last run: {task.last_run_at}")
```

### Check Redis for Task Results

```bash
docker-compose exec redis redis-cli
```

```redis
# List all keys
KEYS *

# Check celery keys
KEYS celery-task-meta-*

# Get a specific task result (replace with actual task ID)
GET celery-task-meta-<task-id>
```

## Testing Error Handling

### Test Retry Logic

```bash
docker-compose exec backend python manage.py shell
```

```python
from celery import shared_task

# Create a test task that fails
@shared_task(bind=True, max_retries=3)
def test_retry_task(self):
    print(f"Attempt {self.request.retries + 1}")
    raise Exception("Test error")

# This will retry 3 times
result = test_retry_task.delay()
```

### Test Task Timeout

Watch logs for tasks that exceed their expected runtime.

## Performance Testing

### Monitor Task Execution Time

```bash
docker-compose exec backend python manage.py shell
```

```python
import time
from ingestion.tasks import update_site_statistics

start = time.time()
result = update_site_statistics.delay()
result.get(timeout=30)
duration = time.time() - start
print(f"Task took {duration:.2f} seconds")
```

### Monitor Worker Load

```bash
docker-compose exec worker celery -A adaptapedia inspect active
docker-compose exec worker celery -A adaptapedia inspect stats
```

## Troubleshooting Tests

### Task Not Executing

1. **Check worker is running:**
   ```bash
   docker-compose ps worker
   ```

2. **Check task is registered:**
   ```bash
   docker-compose logs worker | grep "ingestion.tasks"
   ```

3. **Restart worker:**
   ```bash
   docker-compose restart worker
   ```

### Task Fails with Error

1. **Check worker logs:**
   ```bash
   docker-compose logs worker --tail=50
   ```

2. **Check for import errors:**
   ```bash
   docker-compose exec backend python manage.py shell -c "from ingestion.tasks import *"
   ```

3. **Run task synchronously for debugging:**
   ```python
   from ingestion.tasks import problematic_task
   result = problematic_task()  # Run directly, not async
   ```

### Schedule Not Triggering

1. **Check beat is running:**
   ```bash
   docker-compose ps beat
   ```

2. **Verify schedule in database:**
   ```bash
   docker-compose exec backend python manage.py shell -c "
   from django_celery_beat.models import PeriodicTask
   task = PeriodicTask.objects.get(name='hourly-health-check')
   print('Enabled:', task.enabled)
   print('Schedule:', task.crontab)
   "
   ```

3. **Check beat logs:**
   ```bash
   docker-compose logs beat --tail=50
   ```

## Integration Tests

Create a test file to verify all tasks work:

```python
# tests/test_periodic_tasks.py
import pytest
from ingestion.tasks import (
    health_check,
    update_site_statistics,
    cleanup_expired_sessions,
)

@pytest.mark.django_db
def test_health_check():
    result = health_check()
    assert result['status'] == 'healthy'

@pytest.mark.django_db
def test_update_site_statistics():
    result = update_site_statistics()
    assert 'total_works' in result
    assert 'total_screen_works' in result

@pytest.mark.django_db
def test_cleanup_expired_sessions():
    result = cleanup_expired_sessions()
    assert result['status'] == 'success'
    assert 'deleted_count' in result
```

Run tests:
```bash
docker-compose exec backend pytest tests/test_periodic_tasks.py -v
```

## Expected Results Summary

| Task | Expected Frequency | Expected Duration | Expected Output |
|------|-------------------|-------------------|-----------------|
| health_check | Hourly | < 1s | `{'status': 'healthy'}` |
| update_site_statistics | Daily at 1 AM | 1-5s | Statistics dict with counts |
| run_daily_wikidata_ingestion | Daily at 2 AM | 30-300s | `{'works_created': X, 'screen_works_created': Y}` |
| refresh_tmdb_metadata | Weekly on Sunday 3 AM | 60-600s | `{'processed': X, 'enriched': Y}` |
| cleanup_expired_sessions | Daily at 4 AM | 1-10s | `{'deleted_count': X}` |
| cleanup_expired_jwt_tokens | Weekly on Monday 5 AM | 1-10s | `{'outstanding_deleted': X}` |

## Next Steps

After verifying all tests pass:

1. Monitor tasks for 24-48 hours in development
2. Check logs for any unexpected errors
3. Verify statistics are being cached correctly
4. Ensure no database deadlocks or performance issues
5. Test during high-traffic periods
6. Set up alerting for failed tasks (Sentry, email, etc.)
