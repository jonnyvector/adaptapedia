# Backend Review - Prioritized TODO List

**Last Updated:** 2025-12-30
**Review Status:** Security & Quality Review Complete

---

## ✅ Completed Tasks

### P0 Critical

- [x] **Fix 32 dependency vulnerabilities** (CVEs)
  - Django 4.2.10 → 4.2.27
  - djangorestframework 3.14.0 → 3.15.2
  - gunicorn 21.2.0 → 22.0.0
  - Pillow 10.2.0 → 10.3.0
  - requests 2.31.0 → 2.32.4
  - djangorestframework-simplejwt 5.3.1 → 5.5.1
  - black 24.1.1 → 24.3.0
  - **Status:** ✅ DONE - Committed in 44ff381
  - **Verification:** pip-audit shows 0 vulnerabilities

---

## 🔴 P0 Critical Tasks (Required Before Production)

**None remaining** - All P0 security vulnerabilities have been resolved.

---

## 🟡 P1 High Priority Tasks

### 1. Fix Spoiler Scope Test Failures (Business Logic)

**Priority:** P1-HIGH
**Risk Level:** MEDIUM
**Files Impacted:** `backend/diffs/test_spoilers.py`, `backend/diffs/views.py`

**Issue:**
6 out of 7 failing tests relate to spoiler scope filtering logic:
- `test_filter_max_spoiler_scope_book_only` - Returns 3 instead of 2
- `test_filter_max_spoiler_scope_screen_only` - Returns 3 instead of 2
- `test_spoiler_scope_hierarchy_book_only` - SCREEN_ONLY unexpectedly allowed
- `test_spoiler_scope_hierarchy_screen_only` - BOOK_ONLY unexpectedly allowed
- `test_book_only_and_screen_only_same_level` - Not mutually exclusive
- `test_multiple_diffs_different_scopes` - Returns 7 instead of 5

**Root Cause:**
Implementation in `diffs/views.py:38-48` treats BOOK_ONLY and SCREEN_ONLY as the same hierarchy level (both at level 1), but tests expect them to be mutually exclusive.

**Decision Required:**
1. Should BOOK_ONLY and SCREEN_ONLY be mutually exclusive?
2. Or should they both be visible at the same level?

**Test Plan:**
1. Review SPEC.md for intended spoiler scope behavior
2. Align with frontend implementation
3. Either fix backend logic or update tests
4. Verify all 6 spoiler tests pass

**Definition of Done:**
- All spoiler scope tests passing
- Backend and frontend aligned on spoiler hierarchy
- SPEC.md updated if behavior changes

---

### 2. Fix Permission Test Failure (Validation Issue)

**Priority:** P1-HIGH
**Risk Level:** MEDIUM
**Files Impacted:** `backend/test_permissions.py`, `backend/diffs/serializers.py`

**Issue:**
`test_create_diff_authenticated` - Returns HTTP 400 instead of 201

**Test Plan:**
1. Run test with verbose error output to see validation errors
2. Check DiffItemSerializer required fields
3. Fix test data or serializer validation
4. Verify test passes

**Definition of Done:**
- Test passes with HTTP 201
- Clear validation error messages

---

### 3. Add Database Indexes for Performance

**Priority:** P1-HIGH
**Risk Level:** LOW
**Files Impacted:** `backend/*/models.py`, new migration files

**Issue:**
Foreign keys and frequently queried fields may be missing indexes.

**Areas to Review:**
- DiffItem: work, screen_work, created_by, category, spoiler_scope, status
- DiffVote: diff_item, user
- DiffComment: diff_item, user, parent
- Report: created_by, target_type, status
- ComparisonVote: work, screen_work, user

**Test Plan:**
1. Review current indexes: `python manage.py sqlmigrate <app> <migration>`
2. Identify missing indexes on foreign keys
3. Create migration with `db_index=True` or Meta.indexes
4. Test query performance before/after
5. Verify migrations are reversible

**Definition of Done:**
- All foreign keys have indexes
- Frequently filtered fields have indexes
- Migrations tested and reversible

---

## 🟠 P2 Medium Priority Tasks

### 4. Fix Test Discovery Issue

**Priority:** P2-MEDIUM
**Risk Level:** LOW
**Files Impacted:** `pytest.ini`, `pyproject.toml`, or test file naming

**Issue:**
- TEST_REPORT.md shows 189 tests from previous run
- Current pytest only discovers 54 tests
- Missing ~135 tests

**Test Plan:**
1. Find all test files: `find backend -name "*test*.py"`
2. Check pytest discovery pattern
3. Rename files or update pytest.ini configuration
4. Verify all tests discovered

**Definition of Done:**
- pytest discovers all ~189 tests
- Test count matches TEST_REPORT.md

---

### 5. Fix Django 5.1 Deprecation Warnings

**Priority:** P2-MEDIUM
**Risk Level:** LOW
**Files Impacted:** `backend/adaptapedia/settings/base.py`

**Issue:**
55 deprecation warnings:
1. `STATICFILES_STORAGE` deprecated - use `STORAGES` instead
2. Missing `/app/staticfiles/` directory

**Test Plan:**
1. Update settings to use STORAGES configuration
2. Create staticfiles directory or configure WhiteNoise
3. Run tests - verify 0 deprecation warnings

**Definition of Done:**
- No deprecation warnings in test output
- Static files properly configured

---

### 6. Add Request Logging with Correlation IDs

**Priority:** P2-MEDIUM
**Risk Level:** LOW
**Files Impacted:** `backend/adaptapedia/middleware.py` (new), `settings/base.py`

**Issue:**
No structured logging or request correlation IDs for debugging.

**Implementation:**
```python
# middleware.py
import uuid
import logging

class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.id = str(uuid.uuid4())
        response = self.get_response(request)
        response['X-Request-ID'] = request.id
        return response
```

**Test Plan:**
1. Add middleware to settings
2. Update LOGGING configuration to include request ID
3. Test that all logs include request_id
4. Test X-Request-ID header in responses

**Definition of Done:**
- All logs include request ID
- Easy to trace requests across services
- Response headers include X-Request-ID

---

### 7. Add Health Check Endpoint

**Priority:** P2-MEDIUM
**Risk Level:** LOW
**Files Impacted:** `backend/adaptapedia/urls.py`, new `health/views.py`

**Issue:**
No health/readiness endpoints for load balancers or monitoring.

**Implementation:**
```python
# health/views.py
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """Basic health check."""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")

        return JsonResponse({
            'status': 'healthy',
            'database': 'connected'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=503)

def readiness_check(request):
    """Readiness check for k8s."""
    # Add more checks as needed (Redis, Celery, etc.)
    return JsonResponse({'status': 'ready'})
```

**Test Plan:**
1. Add /health/ and /ready/ endpoints
2. Test both endpoints return JSON
3. Test database failure scenarios
4. Document for deployment team

**Definition of Done:**
- /health/ endpoint checks database
- /ready/ endpoint for k8s readiness probes
- Proper HTTP status codes (200/503)

---

## 🟢 P3 Low Priority Tasks (Technical Debt)

### 8. Remove Docker Compose Version Warning

**Priority:** P3-LOW
**Risk Level:** LOW
**Files Impacted:** `docker-compose.yml`

**Issue:**
`version:` attribute is obsolete in modern docker-compose

**Fix:**
Remove the `version: '3.8'` line from docker-compose.yml

**Definition of Done:**
- No version warning when running docker-compose commands

---

### 9. Add Rate Limiting to Public Endpoints

**Priority:** P3-LOW
**Risk Level:** LOW
**Files Impacted:** `backend/adaptapedia/settings/base.py`, new middleware

**Issue:**
No rate limiting on public endpoints (potential abuse).

**Implementation Options:**
1. django-ratelimit library
2. Custom middleware with Redis
3. API Gateway (nginx/CloudFlare) - preferred for production

**Test Plan:**
1. Install django-ratelimit or similar
2. Add rate limits to critical endpoints:
   - Auth endpoints: 5 req/min
   - Search: 30 req/min
   - Public lists: 60 req/min
3. Test rate limit responses (HTTP 429)

**Definition of Done:**
- Public endpoints have rate limits
- Clear error messages for rate-limited requests

---

### 10. Improve Error Response Consistency

**Priority:** P3-LOW
**Risk Level:** LOW
**Files Impacted:** `backend/adaptapedia/middleware.py` (new), all views

**Issue:**
Error responses may not follow consistent format.

**Standard Format:**
```json
{
  "error": "Brief error message",
  "detail": "Detailed explanation",
  "code": "ERROR_CODE",
  "request_id": "uuid-here"
}
```

**Test Plan:**
1. Create custom exception handler
2. Update settings REST_FRAMEWORK.EXCEPTION_HANDLER
3. Test all error scenarios return consistent format
4. Document error codes

**Definition of Done:**
- All errors use standard format
- Frontend can parse errors consistently

---

## 📊 Security Review Summary

### ✅ Security Strengths

1. **Authentication & Permissions:**
   - Proper use of `IsAuthenticatedOrReadOnly` on public endpoints
   - `IsModerator` permission class correctly restricts moderation actions
   - JWT authentication properly implemented
   - Role-based access control (MOD/ADMIN) enforced

2. **SQL Safety:**
   - ✅ No raw SQL queries found
   - ✅ All queries use Django ORM
   - ✅ Proper use of parameterized queries

3. **Input Validation:**
   - DRF serializers handle validation
   - File upload validation in place (size, type checks)

4. **Query Optimization:**
   - Good use of `select_related()` and `prefetch_related()`
   - Proper query annotations to avoid N+1

5. **Caching:**
   - Trending/browse endpoints use cache (15-30 min TTL)
   - Proper cache key generation

### ⚠️ Areas for Improvement (Non-Critical)

1. **Transaction Boundaries (P2):**
   - Vote creation + reputation award should be atomic
   - Consider wrapping multi-step operations in transactions

2. **Celery Task Error Handling (P2):**
   - Review retry logic and dead-letter queues
   - Add proper error logging for failed tasks

3. **API Validation (P2):**
   - Add request schema validation layer
   - Consider using drf-spectacular for OpenAPI docs

---

## 🎯 Recommended Execution Order

1. **Week 1 - P1 High Priority:**
   - Fix spoiler scope tests
   - Fix permission test
   - Add database indexes

2. **Week 2 - P2 Medium Priority:**
   - Fix test discovery
   - Fix deprecation warnings
   - Add request logging
   - Add health checks

3. **Week 3 - P3 Low Priority:**
   - Add rate limiting
   - Improve error consistency
   - Remove docker compose warning

---

## 📈 Progress Tracking

**Completed:** 1/10 tasks (P0 critical vulnerabilities)
**Remaining:** 9 tasks (3 P1, 5 P2, 1 P3)

**Estimated Effort:**
- P1 tasks: ~8-12 hours
- P2 tasks: ~12-16 hours
- P3 tasks: ~4-6 hours
- **Total:** ~24-34 hours

---

## ✅ Definition of "Production Ready"

For production deployment, the following MUST be complete:
- [x] P0: All security vulnerabilities resolved
- [ ] P1: All failing tests fixed
- [ ] P1: Database indexes added
- [ ] P2: Health check endpoints added
- [ ] P2: Request logging with correlation IDs
- [ ] P2: Deprecation warnings resolved

**Current Status:** 1/6 production requirements met (17%)
