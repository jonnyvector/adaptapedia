# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Adaptapedia** is a community wiki/database that compares books and their screen adaptations (movies/TV), focusing on structured "what changed?" diffs with spoiler-safe controls, voting, and lightweight moderation.

See `SPEC.md` for complete MVP specification.

## Tech Stack

**Frontend:**
- Next.js (App Router) with TypeScript
- SSR for primary pages (safe content)
- Client fetch for spoiler content

**Backend:**
- Django + Django REST Framework
- PostgreSQL database
- Celery + Redis for background jobs
- Celery Beat for scheduled tasks

**Data Sources:**
- Wikidata (pairing graph via P144 relationships)
- Open Library (book metadata)
- TMDb (screen metadata)

## Development Standards

### Code Quality - Never Take Shortcuts

**DRY (Don't Repeat Yourself):**
- Extract reusable logic into services/utilities
- Create shared components for repeated UI patterns
- Use inheritance/composition to avoid duplication

**Type Safety:**
- TypeScript: strict mode, no `any` types allowed
- Django: type hints for all function signatures
- API responses must match TypeORM/Pydantic schemas

**Clarity:**
- Explicit over implicit - clear variable/function names
- No magic numbers/strings - use constants/enums
- Single Responsibility Principle for functions/components/models
- Maximum function length: ~50 lines (refactor if longer)

### Testing - No Feature Is Complete Without Tests

**Backend:**
- Unit tests for models, services, utilities
- Integration tests for all API endpoints
- Test spoiler scope enforcement, voting uniqueness, permission checks
- Minimum 80% coverage for new code

**Frontend:**
- Component tests for user interactions
- Test spoiler toggle, voting flows, form validations
- E2E tests for critical user journeys (search → compare → add diff)

**Run tests before marking any task complete.**

### Security - Non-Negotiable

- Never commit secrets/API keys (use environment variables)
- Validate and sanitize all user inputs
- Use parameterized queries (ORM only, no raw SQL unless essential)
- Authentication checks on all protected endpoints
- CORS configuration: whitelist specific origins only
- CSP headers for frontend
- Rate limiting on public APIs

### Architecture

**Backend:**
- Business logic in services, not views
- Views handle HTTP concerns only (request/response)
- Database queries in model managers/services, not views
- All migrations must be reversible (`python manage.py migrate <app> zero` must work)

**Frontend:**
- Server components by default (Next.js App Router)
- Client components only when needed (interactivity, browser APIs)
- No direct API calls in components - use server actions or API route handlers
- Shared utilities in `lib/`, shared components in `components/`

**API Design:**
- RESTful conventions
- Consistent error responses: `{error: string, detail?: object}`
- Pagination for list endpoints: `{results: [], count: number, next: string|null}`
- API versioning if breaking changes needed

### Performance

**Backend:**
- Use `select_related()`/`prefetch_related()` to avoid N+1 queries
- Index foreign keys and frequently queried fields
- Cache expensive operations (Redis)
- Paginate large result sets

**Frontend:**
- Lazy load heavy components/images
- Use Next.js Image component for optimization
- Minimize client-side JavaScript
- Precompute and cache "Top diffs" via background jobs

### Git Workflow

- Atomic commits with clear, descriptive messages
- No commented-out code in commits
- Branch naming: `feature/description`, `fix/description`, `refactor/description`
- Run tests locally before pushing

## Repo Structure

```
adaptapedia/
├── backend/                 # Django project
│   ├── adaptapedia/         # Project config
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── celery.py
│   ├── works/               # Book works app
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── services.py      # Business logic
│   │   └── tests/
│   ├── screen/              # Screen works app
│   ├── diffs/               # Diff system app
│   ├── users/               # User/auth app
│   ├── moderation/          # Reports/mod queue app
│   ├── ingestion/           # Data ingestion tasks
│   │   ├── wikidata.py
│   │   ├── openlibrary.py
│   │   └── tmdb.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── page.tsx         # Home
│   │   ├── book/[slug]/
│   │   ├── screen/[slug]/
│   │   ├── compare/[book]/[screen]/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── shared/
│   │   ├── diff/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts           # API client
│   │   ├── types.ts
│   │   └── utils.ts
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── .env.example
├── SPEC.md
└── CLAUDE.md
```

## Development Commands

**Backend:**
```bash
# Setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Database
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Run
python manage.py runserver

# Tests
pytest
pytest --cov=. --cov-report=html

# Celery (separate terminals)
celery -A adaptapedia worker -l info
celery -A adaptapedia beat -l info
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Development server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # ESLint
npm run type-check # TypeScript check
```

**Docker:**
```bash
docker-compose up -d          # Start all services
docker-compose logs -f web    # View logs
docker-compose exec web bash  # Shell into container
docker-compose down           # Stop services
```

## Wikidata SPARQL Query for Ingestion

Use this query to fetch book → screen adaptation pairs:

```sparql
SELECT ?screenWork ?screenWorkLabel ?bookWork ?bookWorkLabel WHERE {
  ?screenWork wdt:P144 ?bookWork.  # P144 = "based on"
  ?screenWork wdt:P31/wdt:P279* wd:Q2431196.  # Instance of film/TV series
  ?bookWork wdt:P31/wdt:P279* wd:Q7725634.     # Instance of literary work

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
LIMIT 10000
```

Endpoint: `https://query.wikidata.org/sparql`

Store the QIDs (`?screenWork`, `?bookWork`) for traceability and refreshes.

## Key Implementation Notes

**Spoiler System:**
- Enum: `NONE`, `BOOK_ONLY`, `SCREEN_ONLY`, `FULL`
- SSR renders `NONE` scope only
- Higher scopes loaded client-side after user opts-in
- Never index spoiler content for SEO

**Diff Categories:**
- `PLOT`, `CHARACTER`, `ENDING`, `SETTING`, `THEME`, `TONE`, `TIMELINE`, `WORLDBUILDING`, `OTHER`
- Each diff has: category, claim (short), detail (optional long), spoiler scope, votes

**Voting:**
- `ACCURATE`, `NEEDS_NUANCE`, `DISAGREE`
- Unique constraint: one vote per user per diff
- Display net consensus signals

**Attribution:**
- TMDb logo/attribution on all pages using TMDb data
- Open Library attribution in footer
- Wikidata attribution on data sources page
