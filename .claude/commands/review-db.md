---
description: Review database queries and ORM usage for optimization
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Review database/ORM code in $ARGUMENTS and check for:

**Query Optimization:**
- N+1 query problems (missing `select_related`/`prefetch_related`)
- Unnecessary database hits in loops
- Inefficient filtering or aggregation
- Large querysets that should be paginated
- Duplicate queries that could be cached

**Database Schema:**
- Foreign keys have indexes
- Frequently queried fields are indexed
- Appropriate use of `db_index=True`
- No missing constraints (unique, null, etc.)

**Migration Quality:**
- All migrations are reversible
- `python manage.py migrate <app> zero` would work
- No data loss in migrations
- Proper dependencies between migrations

**ORM Best Practices:**
- Using ORM instead of raw SQL (unless essential)
- Proper use of `only()` and `defer()` for large models
- Appropriate use of `exists()` vs `count()`
- Bulk operations (`bulk_create`, `bulk_update`) for batch inserts

**Caching Opportunities:**
- Expensive queries that could be cached (Redis)
- Denormalized fields for performance
- Computed values stored vs calculated on-the-fly

Analyze query performance and provide specific optimization recommendations.
