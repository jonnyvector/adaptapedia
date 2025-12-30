---
description: Review test coverage and quality
allowed-tools: [Read, Grep, Task, Bash]
argument-hint: <file or directory>
---

Review test coverage for $ARGUMENTS and check for:

**Test Coverage Requirements:**
- Minimum 80% coverage for new code
- All new features have tests
- Critical user journeys have E2E tests
- No untested edge cases

**Backend Testing:**
- Unit tests for models, services, utilities
- Integration tests for all API endpoints
- Spoiler scope enforcement tests
- Voting uniqueness constraint tests
- Permission/authorization checks tested
- Error handling scenarios covered

**Frontend Testing:**
- Component tests for user interactions
- Spoiler toggle functionality tested
- Voting flows tested
- Form validation tested
- E2E tests for critical flows (search → compare → add diff)

**Test Quality:**
- Tests are isolated and independent
- Clear test names describing what's being tested
- Proper use of fixtures/factories
- No flaky tests
- Fast execution time

**Testing Gaps:**
- Missing test files for new features
- Untested error paths
- Missing integration tests
- Insufficient edge case coverage

Run tests and coverage reports:
- Backend: `pytest --cov=. --cov-report=html`
- Frontend: `npm run test`

Identify testing gaps and recommend specific tests to add.
