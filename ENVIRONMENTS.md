# Adaptapedia Environments

This document describes the two-tier environment setup for Adaptapedia.

## Environment Overview

| Environment | Branch | URL | Database | Purpose |
|------------|--------|-----|----------|---------|
| **Local** | any | http://localhost:3000 | Local PostgreSQL (Docker) | Development, testing & staging |
| **Production** | `master` | https://adaptapedia-production.up.railway.app | Railway PostgreSQL (production) | Live site |

**Note:** Local environment serves as both development AND staging. Test thoroughly locally before deploying to production.

## Workflows

### Local Development & Testing

```bash
# Start all services
docker-compose up -d

# Services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - Django Admin: http://localhost:8000/admin
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser (if needed)
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest
cd frontend && npm run test

# Check TypeScript
cd frontend && npm run type-check

# Stop services
docker-compose down
```

### Feature Development Workflow

1. Create a feature branch from `master`:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test **thoroughly** locally

3. Run the pre-deployment checklist (see below)

4. Commit and push:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push -u origin feature/your-feature-name
   ```

5. Create PR to `master` on GitHub

6. Review changes carefully

7. Merge to `master` → **Auto-deploys to production**

### Deploying to Production

**Production deploys automatically when you merge to `master`.**

Before merging to master:
1. ✅ Test thoroughly on local environment
2. ✅ Run pre-deployment checklist (below)
3. ✅ Get PR review if working with a team
4. ✅ Merge to `master`
5. ✅ Monitor Railway deployment logs
6. ✅ Test on production after deployment

## Branch Strategy

```
master (production - auto-deploys to Railway)
  ↑
  PR from feature branches
  ↑
feature/*, fix/*, refactor/*
```

**Simple workflow:**
- Create feature branches from `master`
- Test thoroughly locally
- PR to `master`
- Merge → auto-deploy to production

**Optional: Use `develop` branch for integration**
- If working with a team, you can use the `develop` branch to integrate multiple features before deploying
- Pattern: `feature/* → develop → master`
- For now, direct `feature/* → master` is fine

## Railway Setup

### Production Environment
- **Environment:** `production`
- **Branch:** `master`
- **Services:**
  - `impartial-tranquility` (backend)
  - `adaptapedia` (frontend)
  - PostgreSQL database
  - Redis cache
- **Auto-deploys:** On push to `master` branch

## Environment Variables

### Local Environment (.env file)
```bash
# Django
DEBUG=True
SECRET_KEY=django-insecure-local-dev-key
DB_NAME=adaptapedia
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432
REDIS_URL=redis://redis:6379/0

# API Keys
TMDB_API_KEY=fc9c9bf0b54eb3f152d8fb90b8527fe6
OPEN_LIBRARY_BASE_URL=https://openlibrary.org
WIKIDATA_SPARQL_ENDPOINT=https://query.wikidata.org/sparql

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Production Environment (Railway)

**Frontend Variables:**
```bash
NEXT_PUBLIC_API_URL=https://impartial-tranquility-production.up.railway.app/api
API_URL=https://impartial-tranquility-production.up.railway.app/api
NODE_ENV=production
```

**Backend Variables:**
```bash
DEBUG=False
DJANGO_SETTINGS_MODULE=adaptapedia.settings.production
ALLOWED_HOSTS=impartial-tranquility-production.up.railway.app
CORS_ALLOWED_ORIGINS=https://adaptapedia-production.up.railway.app
SECRET_KEY=<production-secret>
TMDB_API_KEY=fc9c9bf0b54eb3f152d8fb90b8527fe6
OPEN_LIBRARY_BASE_URL=https://openlibrary.org
WIKIDATA_SPARQL_ENDPOINT=https://query.wikidata.org/sparql
# DATABASE_URL, REDIS_URL automatically provided by Railway
```

## Database Management

### Copying Production Data to Local

To test with production data locally:

```bash
# 1. Export from production (get DB URL from Railway dashboard)
docker-compose exec -T db pg_dump -U postgres -d adaptapedia --data-only --column-inserts --no-owner --no-acl \
  > production_data.sql

# 2. Clear local database
docker-compose exec backend python manage.py flush --noinput

# 3. Import production data
docker-compose exec -T db psql -U postgres -d adaptapedia < production_data.sql
```

### Backing Up Production Database

```bash
# Get the public DATABASE_URL from Railway dashboard
pg_dump -d "postgresql://postgres:<password>@maglev.proxy.rlwy.net:<port>/railway" \
  -F c -f backup_$(date +%Y%m%d).dump
```

## Pre-Deployment Checklist

**Run this checklist before every production deployment:**

### Code Quality
- [ ] All tests passing: `docker-compose exec backend pytest`
- [ ] Frontend tests passing: `cd frontend && npm run test`
- [ ] TypeScript builds without errors: `cd frontend && npm run type-check`
- [ ] No linting errors: `cd frontend && npm run lint`
- [ ] Python type check passing (if configured)

### Database
- [ ] Database migrations created if schema changed
- [ ] Migrations tested locally: `docker-compose exec backend python manage.py migrate`
- [ ] Migration reversibility tested: `docker-compose exec backend python manage.py migrate <app> <previous_migration>`

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Book detail pages display correctly
- [ ] Adaptation detail pages display correctly
- [ ] Comparison pages load
- [ ] Authentication flows work (login/signup/logout)
- [ ] Diff creation works
- [ ] Voting works
- [ ] Comments work
- [ ] Bookmarks work
- [ ] User profile pages work
- [ ] No console errors in browser devtools
- [ ] Mobile responsive design works (test on narrow viewport)

### Security
- [ ] No sensitive data in commits (API keys, passwords, etc.)
- [ ] New environment variables added to Railway if needed
- [ ] CORS settings correct
- [ ] Authentication required for protected routes

### Performance
- [ ] Images optimized (using Next.js Image component)
- [ ] No N+1 database queries (check Django logs)
- [ ] API responses are reasonably fast locally

## Troubleshooting

### Production deployment failed
1. Check Railway logs for the failing service in dashboard
2. Verify all environment variables are set correctly
3. Check that migrations were committed and applied
4. Look for TypeScript or Python errors in build logs

### Database migration issues
1. Check migration files are committed to git
2. Run migrations manually via Railway CLI: `railway run --service impartial-tranquility python manage.py migrate`
3. Check for conflicts with existing migrations
4. Verify migration order is correct

### Frontend can't connect to backend
1. Verify `API_URL` and `NEXT_PUBLIC_API_URL` are set in Railway
2. Check `CORS_ALLOWED_ORIGINS` includes production frontend URL
3. Verify backend service is running in Railway dashboard
4. Check for 404s or 500s in Network tab

### Local development issues
1. Ensure Docker containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs backend` or `docker-compose logs frontend`
3. Rebuild containers if needed: `docker-compose up -d --build`
4. Reset database: `docker-compose down -v` then `docker-compose up -d`

## Quick Reference

```bash
# Start local environment
docker-compose up -d

# Create feature branch
git checkout master
git pull origin master
git checkout -b feature/my-feature

# Make changes and test locally
# ... code ...

# Run pre-deployment checklist
cd frontend && npm run type-check && npm run lint
docker-compose exec backend pytest

# Commit and push
git add .
git commit -m "feat: description"
git push -u origin feature/my-feature

# Create PR on GitHub to master
# After PR review, merge to master
# Railway auto-deploys to production
# Monitor deployment in Railway dashboard
```

## Notes

- **Test thoroughly locally** - local is your staging environment
- **Use the pre-deployment checklist** - catches most issues before production
- **Monitor Railway logs** - watch deployment logs when merging to master
- **Production requires care** - review PRs carefully before merging
- **Keep `develop` branch optional** - use it for team integration if needed, but direct `feature/* → master` is fine for solo work
