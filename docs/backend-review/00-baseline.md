# Backend Baseline Report

**Date:** 2025-12-30
**Reviewed by:** Claude Code
**Target:** Adaptapedia Django Backend

---

## Stack Overview

### Runtime & Framework
- **Framework:** Django 4.2.10 + Django REST Framework 3.14.0
- **Language:** Python 3.x with type hints
- **API:** RESTful API with DRF serializers/viewsets
- **Authentication:** JWT via djangorestframework-simplejwt 5.3.1

### Database & ORM
- **Database:** PostgreSQL
- **Driver:** psycopg2-binary 2.9.9
- **ORM:** Django ORM
- **Migrations:** Django migrations (`python manage.py migrate`)

### Background Jobs
- **Queue:** Celery 5.3.6
- **Broker:** Redis 5.0.1
- **Scheduler:** django-celery-beat 2.6.0

### Architecture
- **Type:** Monolith with multiple Django apps
- **Apps:**
  - `works/` - Book works management
  - `screen/` - Screen adaptations management
  - `diffs/` - Diff/comparison system
  - `users/` - User management and authentication
  - `moderation/` - Content moderation
  - `ingestion/` - Data ingestion from external sources (Wikidata, Open Library, TMDb)
  - `adaptapedia/` - Project configuration

### Data Ingestion Sources
- Wikidata (SPARQL queries via SPARQLWrapper)
- Open Library API
- TMDb API
- Uses `requests` library for HTTP calls

### Testing Stack
- **Framework:** pytest 8.0.0 + pytest-django 4.7.0
- **Coverage:** pytest-cov 4.1.0
- **Factories:** factory-boy 3.3.0
- **Location:** Tests in `*/tests/` directories per app

### Code Quality Tools
- **Formatter:** black 24.1.1
- **Linter:** flake8 7.0.0
- **Type Checker:** mypy 1.8.0 with django-stubs 4.2.7

### Production Dependencies
- **WSGI Server:** gunicorn 21.2.0
- **Static Files:** whitenoise 6.6.0
- **Image Processing:** Pillow 10.2.0
- **Config:** python-dotenv 1.0.1

---

## How to Run (Local Development)

### Prerequisites
```bash
# With Docker Compose (recommended)
docker-compose up -d

# Or manually:
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

### Run Application
```bash
# Development server
python manage.py runserver

# Celery worker (separate terminal)
celery -A adaptapedia worker -l info

# Celery beat scheduler (separate terminal)
celery -A adaptapedia beat -l info
```

### Run Tests
```bash
# All tests
pytest

# With coverage
pytest --cov=. --cov-report=html

# Specific app
pytest works/tests/

# Django system checks
python manage.py check
```

### Code Quality
```bash
# Format code
black .

# Lint
flake8

# Type check
mypy .
```

---

## Current Test Baseline

**Date Run:** 2025-12-30
**Command:** `docker-compose exec backend pytest`

### Test Results

```
============================= test session starts ==============================
platform linux -- Python 3.11.14, pytest-8.0.0, pluggy-1.6.0
django: version: 4.2.10, settings: adaptapedia.settings.development
collected 54 items

diffs/test_spoilers.py ..F..F..F..F..FF..                                [ 33%]
test_permissions.py ....F...............................                 [100%]

7 failed, 47 passed, 55 warnings in 13.32s
```

**Summary:**
- **Total Tests:** 54
- **Passing:** 47 (87%)
- **Failing:** 7 (13%)
- **Warnings:** 55 (mostly deprecation warnings)

### Known Failures

**Spoiler Filtering Tests (6 failures):**
1. `test_filter_max_spoiler_scope_book_only` - Expected 2, got 3
2. `test_filter_max_spoiler_scope_screen_only` - Expected 2, got 3
3. `test_spoiler_scope_hierarchy_book_only` - SCREEN_ONLY unexpectedly allowed
4. `test_spoiler_scope_hierarchy_screen_only` - BOOK_ONLY unexpectedly allowed
5. `test_book_only_and_screen_only_same_level` - Not properly separated
6. `test_multiple_diffs_different_scopes` - Count mismatch (7 vs 5 expected)

**Permission Tests (1 failure):**
1. `test_create_diff_authenticated` - Returns 400 instead of 201 (validation error)

### Deprecation Warnings

1. **STATICFILES_STORAGE:** Use STORAGES setting instead (Django 5.1)
2. **No directory at /app/staticfiles/:** Missing static files directory

### Discrepancy Note

The TEST_REPORT.md shows 189 tests with 77% coverage from a previous run, but pytest currently only discovers 54 tests. This suggests:
- Some test files may not be following pytest naming conventions
- Tests may be in non-standard locations
- Django test discovery vs pytest discovery differences

---

## Key Configuration Files

- **Settings:** `backend/adaptapedia/settings/` (base.py, development.py, production.py)
- **URLs:** `backend/adaptapedia/urls.py`
- **Celery:** `backend/adaptapedia/celery.py`
- **Docker:** `docker-compose.yml` (root)
- **Env:** `.env.example` (root)

---

## Security Considerations

### Secrets Management
- Uses environment variables via python-dotenv
- `.env` file (gitignored)
- `.env.example` template provided

### CORS
- django-cors-headers configured
- Settings control allowed origins

---

## Database Backup Strategy

### PostgreSQL Backup Command
```bash
# Using docker-compose
docker-compose exec db pg_dump -U <username> <dbname> > backups/YYYYMMDD-HHMM/backup.sql

# Or using pg_dump directly
pg_dump -h localhost -U <username> -d <dbname> -F c -f backups/YYYYMMDD-HHMM/backup.dump

# Restore
pg_restore -h localhost -U <username> -d <dbname> backups/YYYYMMDD-HHMM/backup.dump
```

### Django Data Backup
```bash
# Dump all data (JSON)
python manage.py dumpdata --indent 2 > backups/YYYYMMDD-HHMM/data.json

# Dump specific app
python manage.py dumpdata diffs --indent 2 > backups/YYYYMMDD-HHMM/diffs.json

# Restore
python manage.py loaddata backups/YYYYMMDD-HHMM/data.json
```

---

## CI/CD

**Status:** To be determined
_(Will document if CI configuration exists)_

---

## Next Steps

1. Run baseline test suite and document results
2. Run dependency vulnerability scan
3. Perform systematic code review across all apps
4. Create prioritized findings and remediation plan
