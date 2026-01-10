# Backend Audit & Refactor Specification

**Branch:** `refactor/backend-audit`
**Date:** 2026-01-10
**Status:** Planning

## Objectives

1. **Code Quality**: Ensure backend follows DRY principles, type safety, and clear separation of concerns
2. **Performance**: Identify and fix N+1 queries, optimize database queries, review caching strategy
3. **Security**: Audit authentication, authorization, input validation, and rate limiting
4. **Architecture**: Review service layer organization, view logic, and API consistency
5. **Testing**: Assess test coverage and quality, identify gaps
6. **Documentation**: Ensure code is well-documented and API is consistent

## Scope

### In Scope
- Django apps: `diffs/`, `works/`, `screen/`, `users/`, `moderation/`, `ingestion/`
- Services layer (`services.py` files)
- Views and serializers
- Models and database schema
- Authentication and permissions
- API endpoints and error handling
- Background tasks (Celery)
- Caching strategy

### Out of Scope
- Frontend code (separate audit)
- Infrastructure/deployment (separate concern)
- Third-party integrations (unless security issues found)

## Audit Areas

### 1. Code Quality & Architecture

#### DRY (Don't Repeat Yourself)
- [ ] Identify duplicated logic across services
- [ ] Review repeated query patterns
- [ ] Check for duplicated validation logic
- [ ] Look for repeated serializer patterns

#### Type Safety
- [ ] Audit all function signatures for type hints
- [ ] Check service methods have proper return types
- [ ] Verify model field types are explicit
- [ ] Review serializer field definitions

#### Separation of Concerns
- [ ] Verify business logic is in services, not views
- [ ] Check views only handle HTTP concerns
- [ ] Ensure models don't contain business logic
- [ ] Review serializers for proper responsibility

#### Code Clarity
- [ ] Check function length (max ~50 lines)
- [ ] Review variable/function naming
- [ ] Identify magic numbers/strings needing constants
- [ ] Look for overly complex conditionals

### 2. Performance

#### Database Queries
- [ ] Audit all querysets for `select_related()`/`prefetch_related()` usage
- [ ] Identify N+1 query problems
- [ ] Review filtering and aggregation efficiency
- [ ] Check for missing database indexes
- [ ] Look for unnecessary database hits

#### Caching
- [ ] Review current cache strategy (5-minute cache on browse endpoints)
- [ ] Identify cacheable but uncached endpoints
- [ ] Check cache invalidation logic
- [ ] Verify cache keys are unique and descriptive

#### API Efficiency
- [ ] Review pagination implementation
- [ ] Check for overfetching (returning too much data)
- [ ] Look for endpoints that could be combined
- [ ] Verify response sizes are reasonable

### 3. Security

#### Authentication & Authorization
- [ ] Review JWT token expiration and refresh logic
- [ ] Audit permission classes on all endpoints
- [ ] Check user authentication flows
- [ ] Verify password hashing and validation

#### Input Validation
- [ ] Review all POST/PUT/PATCH endpoints for validation
- [ ] Check serializer validation is comprehensive
- [ ] Verify file upload validation (diff images)
- [ ] Look for SQL injection risks (should be none with ORM)

#### Authorization Checks
- [ ] Verify users can only access their own data
- [ ] Check moderator permissions are enforced
- [ ] Review voting uniqueness constraints
- [ ] Audit reputation/badge award logic for exploits

#### Rate Limiting
- [ ] Check if rate limiting is implemented
- [ ] Review throttle classes on endpoints
- [ ] Verify public endpoints have appropriate limits

### 4. API Design & Consistency

#### RESTful Conventions
- [ ] Review endpoint naming consistency
- [ ] Check HTTP method usage (GET/POST/PUT/PATCH/DELETE)
- [ ] Verify status code usage is correct
- [ ] Look for non-RESTful patterns

#### Error Handling
- [ ] Audit error response format consistency
- [ ] Check all endpoints return proper error messages
- [ ] Verify error details are helpful but not exposing internals
- [ ] Review exception handling

#### Response Format
- [ ] Check response structure consistency
- [ ] Verify pagination format is uniform
- [ ] Review serializer output consistency
- [ ] Look for missing fields in responses

### 5. Testing

#### Coverage
- [ ] Check current test coverage percentage
- [ ] Identify untested models
- [ ] Find untested services
- [ ] Locate untested API endpoints

#### Test Quality
- [ ] Review test comprehensiveness
- [ ] Check for edge case testing
- [ ] Verify error case testing
- [ ] Look for integration test gaps

#### Critical Paths
- [ ] Ensure diff creation is tested
- [ ] Verify voting logic is tested
- [ ] Check spoiler scope enforcement tests
- [ ] Review authentication flow tests

### 6. Database & Models

#### Schema Review
- [ ] Check for missing indexes on foreign keys
- [ ] Review frequently queried fields for indexes
- [ ] Verify unique constraints are in place
- [ ] Look for missing database constraints

#### Migrations
- [ ] Verify all migrations are reversible
- [ ] Check for data migrations that need review
- [ ] Review migration dependencies
- [ ] Look for missing migrations

#### Model Design
- [ ] Review model relationships (ForeignKey, ManyToMany)
- [ ] Check for missing `related_name` attributes
- [ ] Verify `__str__` methods are meaningful
- [ ] Look for missing Meta options (ordering, indexes)

### 7. Background Tasks (Celery)

#### Task Design
- [ ] Review Celery task organization
- [ ] Check for long-running tasks
- [ ] Verify task retries are configured
- [ ] Look for missing error handling

#### Scheduled Tasks
- [ ] Review Celery Beat schedule
- [ ] Check scheduled task necessity
- [ ] Verify task timing is optimal
- [ ] Look for overlapping tasks

## Specific Issues to Address

### Known Issues
1. **Vote Count Inconsistency**: Just fixed - verify implementation is optimal
2. **Comparison Vote Fetching**: New `_get_comparison_votes()` method - review efficiency
3. **Cache Invalidation**: Review when cache should be cleared (new diffs, votes, etc.)
4. **Token Refresh**: Recently implemented - verify security best practices

### Areas of Concern
1. **ComparisonVote Counting**: Current implementation queries in a loop - could be optimized with single query
2. **Browse Endpoints**: Multiple separate queries - could potentially combine
3. **Reputation Service**: Complex logic - ensure it's accurate and performant
4. **Spoiler Scope Enforcement**: Critical feature - needs thorough testing

## Deliverables

1. **Audit Report**: Detailed findings document
   - Issues found (categorized by severity: Critical/High/Medium/Low)
   - Performance metrics (query counts, response times)
   - Security findings
   - Code quality issues

2. **Refactor Plan**: Prioritized list of changes
   - Quick wins (low effort, high impact)
   - Performance improvements
   - Security fixes (immediate)
   - Architecture improvements (longer term)

3. **Code Changes**: Actual refactoring
   - Apply DRY principles
   - Performance optimizations
   - Security hardening
   - Add missing tests

4. **Documentation Updates**:
   - Update docstrings
   - Add inline comments where needed
   - Update CLAUDE.md with findings
   - Create migration guide if needed

## Success Criteria

- [ ] No N+1 queries in critical paths
- [ ] All API endpoints have consistent error handling
- [ ] Test coverage > 80% for new code
- [ ] All security best practices followed
- [ ] Services follow single responsibility principle
- [ ] All function signatures have type hints
- [ ] Cache invalidation is correct and documented
- [ ] Performance benchmarks show improvement (or no regression)

## Timeline

### Phase 1: Audit (Current)
- Create this specification
- Review all backend code systematically
- Document findings

### Phase 2: Prioritization
- Categorize issues by severity and effort
- Create prioritized refactor plan
- Get approval on changes

### Phase 3: Implementation
- Fix critical security issues immediately
- Implement performance improvements
- Refactor for code quality
- Add missing tests

### Phase 4: Testing & Documentation
- Run full test suite
- Performance testing
- Update documentation
- Code review

## Notes

- Follow existing patterns in CLAUDE.md
- Don't break existing functionality
- Maintain backward compatibility for API
- Run migrations on test database first
- Keep refactors focused and atomic
