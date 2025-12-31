# Backend Security & Code Review - Findings

**Date:** 2025-12-30
**Reviewed by:** Claude Code
**Scope:** Adaptapedia Django Backend - Full Security & Quality Review

---

## P0 Critical Issues (Security Vulnerabilities)

### CRITICAL: 32 Known Security Vulnerabilities in Dependencies

**Severity:** P0 - CRITICAL
**Risk Level:** HIGH
**Impact:** Multiple CVEs affecting core framework and libraries

**Details:**

#### Django 4.2.10 → 4.2.27 (24 CVEs)
- CVE-2025-64460, CVE-2025-13372 - Latest critical vulnerabilities
- CVE-2025-64459, CVE-2025-64458 - Security issues
- CVE-2025-59682, CVE-2025-59681 - Security issues
- CVE-2025-57833 - Security vulnerability
- CVE-2024-45231 - Security vulnerability
- Multiple PYSEC advisories (PYSEC-2025-47, PYSEC-2025-13, PYSEC-2025-1, etc.)

**Fix Required:** Upgrade to Django 4.2.27 (latest 4.2.x LTS)

#### Django REST Framework 3.14.0 → 3.15.2+
- CVE-2024-21520 - Security vulnerability

**Fix Required:** Upgrade to DRF 3.15.2 or later

#### djangorestframework-simplejwt 5.3.1 → 5.5.1+
- CVE-2024-22513 - JWT security vulnerability

**Fix Required:** Upgrade to 5.5.1 or later

#### Gunicorn 21.2.0 → 22.0.0+
- CVE-2024-1135 - Security vulnerability
- CVE-2024-6827 - Security vulnerability

**Fix Required:** Upgrade to Gunicorn 22.0.0 or later

#### Pillow 10.2.0 → 10.3.0+
- CVE-2024-28219 - Image processing vulnerability

**Fix Required:** Upgrade to Pillow 10.3.0 or later

#### requests 2.31.0 → 2.32.4+
- CVE-2024-35195 - Security vulnerability
- CVE-2024-47081 - Security vulnerability

**Fix Required:** Upgrade to requests 2.32.4 or later

#### black 24.1.1 → 24.3.0+
- PYSEC-2024-48 - Security issue

**Fix Required:** Upgrade to black 24.3.0 or later (development dependency)

**Test Plan:**
1. Backup current requirements.txt
2. Update all vulnerable packages to safe versions
3. Run `python manage.py check` - verify no Django issues
4. Run full test suite - ensure no breaking changes
5. Test local development server startup
6. Test Celery worker/beat startup

**Definition of Done:**
- All CVEs resolved (pip-audit shows 0 vulnerabilities)
- All tests passing
- Django system check passes
- Application starts successfully

---

## P0 Critical Issues (Security - Auth & Permissions)

### To Be Investigated

_(Placeholder - will be populated after code review)_

Checklist:
- [ ] All API endpoints have proper authentication
- [ ] Permission classes are correctly applied
- [ ] JWT tokens are properly validated
- [ ] Role-based access control (MOD/ADMIN) is enforced
- [ ] No auth bypass vulnerabilities

---

## P0 Critical Issues (Security - Input Validation & SQL Safety)

### To Be Investigated

_(Placeholder - will be populated after code review)_

Checklist:
- [ ] All user inputs are validated
- [ ] No raw SQL queries (or properly parameterized)
- [ ] ORM queries are safe from injection
- [ ] File uploads are validated (size, type, content)
- [ ] No command injection vulnerabilities

---

## P1 High Priority Issues

### Test Failures - Spoiler Scope Logic

**Severity:** P1 - HIGH
**Risk Level:** MEDIUM
**Impact:** Business logic may not match specification

**Details:**

6 out of 7 failing tests are related to spoiler scope filtering:

1. `test_filter_max_spoiler_scope_book_only` - Returns 3 items instead of 2
2. `test_filter_max_spoiler_scope_screen_only` - Returns 3 items instead of 2
3. `test_spoiler_scope_hierarchy_book_only` - SCREEN_ONLY unexpectedly allowed
4. `test_spoiler_scope_hierarchy_screen_only` - BOOK_ONLY unexpectedly allowed
5. `test_book_only_and_screen_only_same_level` - Not properly separated
6. `test_multiple_diffs_different_scopes` - Returns 7 items instead of 5

**Root Cause:**
Tests expect BOOK_ONLY and SCREEN_ONLY to be mutually exclusive (same hierarchy level), but implementation may treat them differently.

**Test Plan:**
1. Review spoiler scope filtering logic in views/serializers
2. Review SPEC.md for intended behavior
3. Either fix implementation or update tests to match requirements
4. Re-run spoiler tests to verify fix

**Definition of Done:**
- All spoiler scope tests passing
- Behavior matches specification
- Frontend and backend aligned on spoiler scope hierarchy

---

### Test Failure - Permission/Validation Issue

**Severity:** P1 - HIGH
**Risk Level:** MEDIUM
**Impact:** May indicate validation gap or missing required field

**Details:**

`test_create_diff_authenticated` - Returns HTTP 400 instead of 201

**Test Plan:**
1. Review test data for missing required fields
2. Check DiffItem serializer validation rules
3. Add proper error message logging to identify validation issue
4. Fix test or validation logic

**Definition of Done:**
- Test passes with HTTP 201
- All required fields properly validated

---

## P1 High Priority Issues (Performance)

### To Be Investigated

_(Placeholder - will be populated after code review)_

Checklist:
- [ ] Check for N+1 queries in views
- [ ] Verify `select_related()` and `prefetch_related()` usage
- [ ] Review database indexes on foreign keys
- [ ] Check pagination on all list endpoints
- [ ] Review query performance for complex filters

---

## P2 Medium Priority Issues

### Test Discovery Issue

**Severity:** P2 - MEDIUM
**Risk Level:** LOW
**Impact:** Not all tests are being discovered and run

**Details:**

- Previous TEST_REPORT.md shows 189 tests
- Current pytest run only discovers 54 tests
- Missing ~135 tests

**Possible Causes:**
1. Tests not following pytest naming conventions (`test_*.py` or `*_test.py`)
2. Tests in non-standard locations
3. Django test discovery vs pytest discovery

**Test Plan:**
1. Search for all test files: `find . -name "*test*.py"`
2. Check naming conventions
3. Update pytest configuration if needed
4. Re-run discovery

**Definition of Done:**
- All tests discoverable by pytest
- Test count matches expected (~189 tests)

---

### Django 5.1 Deprecation Warnings

**Severity:** P2 - MEDIUM
**Risk Level:** LOW
**Impact:** Future compatibility issues

**Details:**

55 deprecation warnings during test runs:

1. `STATICFILES_STORAGE` setting deprecated - use `STORAGES` instead
2. Missing `/app/staticfiles/` directory

**Test Plan:**
1. Update settings to use new STORAGES configuration
2. Create staticfiles directory or configure WhiteNoise properly
3. Run tests to verify warnings resolved

**Definition of Done:**
- No deprecation warnings in test output
- Static files configured correctly for Django 5.x

---

## P2 Medium Priority Issues (Code Quality)

### To Be Investigated

_(Placeholder - will be populated after code review)_

Checklist:
- [ ] Consistent error handling across views
- [ ] Proper use of transactions for multi-step operations
- [ ] Service layer separation (business logic vs views)
- [ ] Serializer validation consistency
- [ ] Test coverage for critical paths

---

## P3 Low Priority Issues (Technical Debt)

### Docker Compose Version Warning

**Severity:** P3 - LOW
**Risk Level:** LOW
**Impact:** Cosmetic warning

**Details:**

`version` attribute in docker-compose.yml is obsolete

**Fix:** Remove `version:` line from docker-compose.yml

---

## Summary Statistics

**Total Issues Found:** TBD (review in progress)

**By Priority:**
- P0 Critical: 1 confirmed (32 CVEs)
- P1 High: 2 confirmed (test failures)
- P2 Medium: 2 confirmed (deprecations, test discovery)
- P3 Low: 1 confirmed (docker compose)

**Next Steps:**
1. ✅ Complete dependency vulnerability audit
2. ⏳ Fix P0 dependency vulnerabilities
3. ⏳ Conduct security code review (auth, permissions, input validation)
4. ⏳ Review correctness (transactions, race conditions)
5. ⏳ Review performance (N+1 queries, indexes)
6. ⏳ Review reliability (error handling, Celery)
7. ⏳ Review observability (logging, health checks)
8. ⏳ Create prioritized todo list
