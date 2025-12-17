# Adaptapedia

A community wiki/database that compares books and their screen adaptations (movies/TV), focusing on structured "what changed?" diffs with spoiler-safe controls, voting, and lightweight moderation.

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Setup

1. **Clone and setup environment:**
   ```bash
   cp .env.example .env
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Run migrations and create superuser:**
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   ```

4. **Access the applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

### Development Commands

**Backend:**
```bash
# View logs
docker-compose logs -f backend

# Run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest

# Access Django shell
docker-compose exec backend python manage.py shell
```

**Frontend:**
```bash
# View logs
docker-compose logs -f frontend

# Install dependencies
docker-compose exec frontend npm install

# Run linter
docker-compose exec frontend npm run lint

# Type check
docker-compose exec frontend npm run type-check
```

**Celery Tasks:**
```bash
# Trigger Wikidata ingestion
docker-compose exec backend python manage.py shell
>>> from ingestion.wikidata import ingest_wikidata_pairs
>>> ingest_wikidata_pairs.delay()
```

### Stop Services

```bash
docker-compose down
```

## Project Structure

- `backend/` - Django REST API
  - `works/` - Book works app
  - `screen/` - Screen adaptations app
  - `diffs/` - Diff comparison system
  - `users/` - User management
  - `moderation/` - Reports and moderation
  - `ingestion/` - Data ingestion tasks

- `frontend/` - Next.js frontend
  - `app/` - Next.js App Router pages
  - `components/` - React components
  - `lib/` - Utilities and API client

## Documentation

- See [SPEC.md](./SPEC.md) for complete MVP specification
- See [CLAUDE.md](./CLAUDE.md) for development standards and architecture

## Tech Stack

**Backend:**
- Django 5.0 + Django REST Framework
- PostgreSQL
- Celery + Redis
- Wikidata, Open Library, TMDb APIs

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## License

TBD
