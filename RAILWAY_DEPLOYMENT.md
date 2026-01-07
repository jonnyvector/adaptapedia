# Railway Deployment Guide for Adaptapedia

This guide walks you through deploying Adaptapedia to Railway with Redis caching for optimal performance.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **TMDB API Key**: Get one at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

## Architecture Overview

Railway will run the following services:
- **PostgreSQL** (managed database)
- **Redis** (managed cache/broker)
- **Backend** (Django API with Gunicorn)
- **Worker** (Celery worker for background jobs)
- **Beat** (Celery beat for scheduled tasks)
- **Frontend** (Next.js production build)

## Step-by-Step Deployment

### 1. Create New Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your Adaptapedia repository
4. Railway will create a new project

### 2. Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will provision a database and set environment variables automatically

### 3. Add Redis

1. Click **"+ New"** again
2. Select **"Database" → "Redis"**
3. Railway will provision Redis with automatic connection URL

### 4. Deploy Backend Service

1. Click **"+ New" → "GitHub Repo"** (select your repo again)
2. Name the service: **"backend"**
3. Configure settings:
   - **Root Directory**: `/backend`
   - **Build Command**: (leave empty, uses Dockerfile)
   - **Start Command**: (leave empty, uses Dockerfile CMD)

4. Add environment variables (Settings → Variables):
   ```bash
   # Django
   SECRET_KEY=<generate-random-key-use-https://djecrety.ir/>
   DJANGO_SETTINGS_MODULE=adaptapedia.settings.production
   DEBUG=False
   ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}}
   CORS_ALLOWED_ORIGINS=https://${{FRONTEND_RAILWAY_DOMAIN}}

   # Database (auto-populated by Railway PostgreSQL plugin)
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DB_NAME=${{Postgres.PGDATABASE}}
   DB_USER=${{Postgres.PGUSER}}
   DB_PASSWORD=${{Postgres.PGPASSWORD}}
   DB_HOST=${{Postgres.PGHOST}}
   DB_PORT=${{Postgres.PGPORT}}

   # Redis (auto-populated by Railway Redis plugin)
   REDIS_URL=${{Redis.REDIS_URL}}

   # External APIs
   TMDB_API_KEY=<your-tmdb-api-key>
   OPEN_LIBRARY_BASE_URL=https://openlibrary.org
   WIKIDATA_SPARQL_ENDPOINT=https://query.wikidata.org/sparql
   ```

5. **Generate Domain**: Settings → Networking → Generate Domain
6. Note the backend URL for frontend configuration

### 5. Deploy Celery Worker

1. Click **"+ New" → "GitHub Repo"**
2. Name the service: **"worker"**
3. Configure:
   - **Root Directory**: `/backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Start Command**: `celery -A adaptapedia worker -l info --concurrency 2`

4. Add same environment variables as backend (you can copy them)

### 6. Deploy Celery Beat

1. Click **"+ New" → "GitHub Repo"**
2. Name the service: **"beat"**
3. Configure:
   - **Root Directory**: `/backend`
   - **Dockerfile Path**: `Dockerfile`
   - **Start Command**: `celery -A adaptapedia beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler`

4. Add same environment variables as backend

### 7. Deploy Frontend

1. Click **"+ New" → "GitHub Repo"**
2. Name the service: **"frontend"**
3. Configure:
   - **Root Directory**: `/frontend`
   - **Dockerfile Path**: `Dockerfile.prod`
   - **Build Arguments**:
     ```
     NEXT_PUBLIC_API_URL=https://<backend-railway-domain>/api
     ```

4. Add environment variables:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://<backend-railway-domain>/api
   ```

5. **Generate Domain**: Settings → Networking → Generate Domain
6. Copy this domain and add it to backend's `CORS_ALLOWED_ORIGINS`

### 8. Run Database Migrations

After backend is deployed:

1. Go to backend service
2. Click **"Deployments"** tab → Select latest deployment
3. Click **"View Logs"**
4. In the service settings, go to **"Variables"**
5. Connect to shell: Railway CLI or use one-time migration job

**Using Railway CLI:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run -s backend python manage.py migrate

# Create superuser (optional)
railway run -s backend python manage.py createsuperuser

# Collect static files
railway run -s backend python manage.py collectstatic --noinput
```

### 9. Update Backend CORS Settings

After frontend domain is generated:

1. Go to backend service variables
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS=https://<your-frontend-domain>.railway.app
   ```
3. Update `ALLOWED_HOSTS`:
   ```
   ALLOWED_HOSTS=<your-backend-domain>.railway.app
   ```

### 10. Verify Deployment

Test each service:

1. **Backend Health**: `https://<backend-domain>/api/health/`
2. **Django Admin**: `https://<backend-domain>/admin/`
3. **Frontend**: `https://<frontend-domain>/`

Check logs in Railway dashboard if any service fails.

## Production Environment Variables Summary

Create a `.env.production` file locally (do NOT commit) for reference:

```bash
# Django Backend
SECRET_KEY=<generate-with-djecrety>
DJANGO_SETTINGS_MODULE=adaptapedia.settings.production
DEBUG=False
ALLOWED_HOSTS=<backend-domain>.railway.app
CORS_ALLOWED_ORIGINS=https://<frontend-domain>.railway.app

# Database (from Railway PostgreSQL)
DATABASE_URL=<from-railway>
DB_NAME=<from-railway>
DB_USER=<from-railway>
DB_PASSWORD=<from-railway>
DB_HOST=<from-railway>
DB_PORT=<from-railway>

# Redis (from Railway Redis)
REDIS_URL=<from-railway>

# External APIs
TMDB_API_KEY=<your-key>
OPEN_LIBRARY_BASE_URL=https://openlibrary.org
WIKIDATA_SPARQL_ENDPOINT=https://query.wikidata.org/sparql

# Frontend
NEXT_PUBLIC_API_URL=https://<backend-domain>.railway.app/api
```

## Scaling Configuration

### Vertical Scaling (More Resources)

In Railway dashboard → Service → Settings:
- **Memory**: Start with 512MB, increase to 1-2GB if needed
- **CPU**: Shared vCPU is fine for start, upgrade to dedicated if bottlenecked

### Horizontal Scaling (More Instances)

For backend service:
1. Settings → Replicas → Set to 2-3 instances
2. Railway will automatically load balance

For worker service:
1. Increase `--concurrency` in start command: `celery -A adaptapedia worker -l info --concurrency 4`

### Database Connection Pooling

If you hit connection limits, add to backend environment:
```bash
DB_CONN_MAX_AGE=600  # Reuse connections for 10 minutes
```

## Monitoring & Logs

### View Logs
- Railway Dashboard → Service → Deployments → View Logs
- Filter by service: backend, worker, beat, frontend

### Set Up Alerts
1. Settings → Observability
2. Configure alerts for:
   - High memory usage (>80%)
   - Service crashes
   - Error rate spikes

### Error Tracking (Optional)

Add Sentry for production errors:

1. Sign up at [sentry.io](https://sentry.io)
2. Add to `backend/requirements.txt`:
   ```
   sentry-sdk==1.40.0
   ```
3. Add to `backend/adaptapedia/settings/production.py`:
   ```python
   import sentry_sdk

   sentry_sdk.init(
       dsn=os.environ.get('SENTRY_DSN'),
       environment='production',
       traces_sample_rate=0.1,
   )
   ```
4. Add `SENTRY_DSN` to Railway environment variables

## Cost Optimization

### Railway Pricing (as of 2024)

- **Starter**: $5/month credit (good for small apps)
- **Developer**: $20/month (good for growing apps)
- **Team**: Usage-based

### Reducing Costs

1. **Scale down during low traffic**: Use Railway's pause feature
2. **Optimize Redis memory**: Set `maxmemory` limit in Redis config
3. **Database backups**: Railway auto-backups, no extra cost
4. **Use caching aggressively**: Reduce database/API calls

## Troubleshooting

### Backend won't start
- Check logs for migration errors
- Verify all environment variables are set
- Ensure PostgreSQL is healthy

### Frontend can't connect to API
- Verify `NEXT_PUBLIC_API_URL` matches backend domain
- Check CORS settings in backend
- Ensure backend domain is accessible

### Celery workers not processing tasks
- Check Redis connection
- Verify worker logs for errors
- Ensure `REDIS_URL` is correct in worker service

### High memory usage
- Check for memory leaks in logs
- Reduce Celery concurrency
- Scale up service memory

## Custom Domain Setup (Optional)

1. Buy domain (Namecheap, Cloudflare, etc.)
2. In Railway → Service → Settings → Networking
3. Add custom domain
4. Update DNS records as instructed by Railway
5. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to include custom domain

## Continuous Deployment

Railway automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push to `main` branch
3. Railway detects changes and redeploys
4. Monitor deployment in Railway dashboard

### Deployment Workflow

```bash
# Make changes
git add .
git commit -m "feat: new feature"

# Push to trigger deploy
git push origin main

# Railway will:
# 1. Build new Docker images
# 2. Run health checks
# 3. Gradually shift traffic to new version
# 4. Rollback if health checks fail
```

## Health Checks

Railway uses built-in health checks. Add a health endpoint to Django:

```python
# backend/adaptapedia/urls.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    path('health/', health_check),
    # ... other urls
]
```

## Database Backups

Railway automatically backs up PostgreSQL daily. To restore:

1. Railway Dashboard → PostgreSQL service
2. Click "Backups" tab
3. Select backup to restore
4. Follow restoration instructions

## Next Steps

After successful deployment:

1. ✅ Test all features in production
2. ✅ Run a data ingestion task to populate database
3. ✅ Set up monitoring (Sentry, LogRocket)
4. ✅ Configure custom domain
5. ✅ Add SSL certificate (Railway auto-provisions Let's Encrypt)
6. ✅ Set up staging environment (duplicate Railway project)

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Adaptapedia Issues**: [GitHub Issues](https://github.com/yourusername/adaptapedia/issues)

---

**Estimated Time to Deploy**: 30-45 minutes

**Estimated Monthly Cost**: $20-40 (Starter tier can handle 10k-50k users)
