---
description: Review Django backend code for API best practices
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Review the Django code in $ARGUMENTS and check for:

**Architecture & Separation of Concerns:**
- Business logic is in services, not views
- Views only handle HTTP concerns (request/response)
- Database queries are in model managers/services, not views
- Proper use of Django ORM patterns

**Performance:**
- Proper use of `select_related()` and `prefetch_related()` to avoid N+1 queries
- Appropriate database indexes on foreign keys and frequently queried fields
- Query optimization opportunities
- Pagination for large result sets

**API Design:**
- RESTful conventions followed
- Consistent error responses: `{error: string, detail?: object}`
- Proper serializer usage and validation
- Correct HTTP status codes

**Code Quality:**
- No code duplication (DRY principle)
- Clear, descriptive function/variable names
- Functions under ~50 lines
- Type hints on all function signatures

Compare against standards in CLAUDE.md and provide specific, actionable recommendations.
