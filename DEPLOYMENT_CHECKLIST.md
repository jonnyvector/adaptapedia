# Railway Deployment Checklist

Quick reference for deploying Adaptapedia to Railway.

## ✅ Pre-Deployment Preparation

- [ ] Code pushed to GitHub
- [ ] Get TMDB API key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
- [ ] Generate Django SECRET_KEY at [djecrety.ir](https://djecrety.ir)
- [ ] Railway account created at [railway.app](https://railway.app)

## ✅ Railway Setup (5-10 minutes)

- [ ] Create new Railway project from GitHub repo
- [ ] Add PostgreSQL database plugin
- [ ] Add Redis plugin
- [ ] Note database/redis URLs (auto-populated in environment)

## ✅ Backend Service (10 minutes)

- [ ] Deploy backend service from `/backend` directory
- [ ] Set environment variables:
  - `SECRET_KEY` (from djecrety.ir)
  - `DJANGO_SETTINGS_MODULE=adaptapedia.settings.production`
  - `DEBUG=False`
  - `ALLOWED_HOSTS` (Railway domain)
  - `TMDB_API_KEY` (from TMDb)
  - Database vars (auto-populated)
  - Redis vars (auto-populated)
- [ ] Generate public domain
- [ ] Wait for deployment to complete

## ✅ Worker & Beat Services (5 minutes)

- [ ] Deploy worker service (same repo, `/backend` directory)
  - Start command: `celery -A adaptapedia worker -l info --concurrency 2`
  - Copy environment variables from backend
- [ ] Deploy beat service (same repo, `/backend` directory)
  - Start command: `celery -A adaptapedia beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler`
  - Copy environment variables from backend

## ✅ Frontend Service (10 minutes)

- [ ] Deploy frontend service from `/frontend` directory
- [ ] Use `Dockerfile.prod`
- [ ] Set build arg: `NEXT_PUBLIC_API_URL=https://<backend-domain>/api`
- [ ] Set environment variables:
  - `NODE_ENV=production`
  - `NEXT_PUBLIC_API_URL=https://<backend-domain>/api`
- [ ] Generate public domain
- [ ] Wait for build to complete

## ✅ Post-Deployment Configuration (10 minutes)

- [ ] Update backend `CORS_ALLOWED_ORIGINS` with frontend domain
- [ ] Run database migrations via Railway CLI:
  ```bash
  railway run -s backend python manage.py migrate
  railway run -s backend python manage.py collectstatic --noinput
  railway run -s backend python manage.py createsuperuser
  ```
- [ ] Verify all services are healthy

## ✅ Testing & Verification (5-10 minutes)

- [ ] Backend health check: `https://<backend-domain>/api/health/`
- [ ] Django admin: `https://<backend-domain>/admin/`
- [ ] Frontend: `https://<frontend-domain>/`
- [ ] Test search functionality
- [ ] Test book/screen detail pages
- [ ] Check logs for errors

## ✅ Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure Sentry error tracking
- [ ] Set up monitoring alerts
- [ ] Create staging environment
- [ ] Configure automatic backups
- [ ] Add CloudFlare CDN

## 📊 Expected Costs

- **Starter Plan**: $5-20/month (10k-50k users)
- **Developer Plan**: $20-40/month (50k-200k users)
- **Scaled Plan**: $40-100+/month (200k+ users)

## 🚀 Total Deployment Time

**30-45 minutes** for first deployment

## 📚 Resources

- Full guide: `RAILWAY_DEPLOYMENT.md`
- Environment template: `.env.production.example`
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)

## 🆘 Common Issues

**Backend won't start:**
- Check SECRET_KEY is set
- Verify DATABASE_URL is valid
- Check logs for migration errors

**Frontend can't connect:**
- Verify CORS_ALLOWED_ORIGINS includes frontend domain
- Check NEXT_PUBLIC_API_URL is correct
- Ensure backend domain is accessible

**Workers not processing:**
- Verify REDIS_URL is correct
- Check worker logs
- Ensure beat service is running

---

**Last Updated**: 2024
