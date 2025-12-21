"""Periodic tasks for Adaptapedia data ingestion and maintenance."""
import logging
from typing import Dict, Any
from datetime import timedelta
from django.utils import timezone
from django.contrib.sessions.models import Session
from django.db.models import Count, Q
from django.core.cache import cache
from celery import shared_task
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from works.models import Work
from screen.models import ScreenWork, AdaptationEdge
from diffs.models import DiffItem
from users.models import User
from .wikidata import ingest_wikidata_pairs
from .tmdb import enrich_screenwork_from_tmdb

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def run_daily_wikidata_ingestion(self) -> Dict[str, Any]:
    """
    Run daily Wikidata ingestion to fetch new book-to-screen adaptations.

    This task queries Wikidata's SPARQL endpoint to find relationships between
    literary works and their screen adaptations, creating or updating records
    in the database.

    Returns:
        dict: Statistics about the ingestion (works created, screen works created, edges, errors)
    """
    logger.info("Starting daily Wikidata ingestion")

    try:
        stats = ingest_wikidata_pairs()

        logger.info(
            f"Wikidata ingestion completed: "
            f"{stats.get('works_created', 0)} works created, "
            f"{stats.get('screen_works_created', 0)} screen works created, "
            f"{stats.get('edges_created', 0)} edges created, "
            f"{stats.get('errors', 0)} errors"
        )

        # Cache the stats for display in admin dashboard
        cache.set('last_wikidata_ingestion', {
            'timestamp': timezone.now().isoformat(),
            'stats': stats
        }, timeout=86400)  # 24 hours

        return {
            'status': 'success',
            'timestamp': timezone.now().isoformat(),
            **stats
        }
    except Exception as exc:
        logger.error(f"Wikidata ingestion failed: {exc}", exc_info=True)
        # Retry after 1 hour
        raise self.retry(exc=exc, countdown=3600)


@shared_task(bind=True, max_retries=3)
def refresh_tmdb_metadata(self) -> Dict[str, Any]:
    """
    Refresh TMDb metadata for screen works.

    Finds screen works that:
    - Have a tmdb_id but missing/old metadata (poster, summary)
    - Are missing tmdb_id and could be matched

    Returns:
        dict: Statistics about the refresh operation
    """
    logger.info("Starting TMDb metadata refresh")

    stats = {
        'processed': 0,
        'enriched': 0,
        'errors': 0,
        'skipped': 0,
    }

    try:
        # Find screen works that need enrichment
        # Priority 1: Has tmdb_id but missing metadata
        screen_works_needing_enrichment = ScreenWork.objects.filter(
            tmdb_id__isnull=False
        ).filter(
            Q(poster_url='') | Q(summary='')
        )[:100]  # Limit to 100 per run to avoid rate limits

        # Priority 2: No tmdb_id at all (but limit to avoid overwhelming the API)
        if len(screen_works_needing_enrichment) < 50:
            screen_works_without_tmdb = ScreenWork.objects.filter(
                tmdb_id__isnull=True
            )[:50 - len(screen_works_needing_enrichment)]

            screen_works_needing_enrichment = list(screen_works_needing_enrichment) + list(screen_works_without_tmdb)

        logger.info(f"Found {len(screen_works_needing_enrichment)} screen works to enrich")

        for screen_work in screen_works_needing_enrichment:
            try:
                result = enrich_screenwork_from_tmdb(screen_work.id)
                stats['processed'] += 1

                if result.get('success'):
                    stats['enriched'] += 1
                else:
                    if 'not found' in result.get('error', '').lower():
                        stats['skipped'] += 1
                    else:
                        stats['errors'] += 1
                        logger.warning(f"Failed to enrich screen work {screen_work.id}: {result.get('error')}")

            except Exception as e:
                stats['errors'] += 1
                logger.error(f"Error enriching screen work {screen_work.id}: {e}", exc_info=True)

        logger.info(
            f"TMDb refresh completed: "
            f"{stats['processed']} processed, "
            f"{stats['enriched']} enriched, "
            f"{stats['errors']} errors, "
            f"{stats['skipped']} skipped"
        )

        # Cache the stats
        cache.set('last_tmdb_refresh', {
            'timestamp': timezone.now().isoformat(),
            'stats': stats
        }, timeout=604800)  # 7 days

        return {
            'status': 'success',
            'timestamp': timezone.now().isoformat(),
            **stats
        }

    except Exception as exc:
        logger.error(f"TMDb refresh failed: {exc}", exc_info=True)
        # Retry after 2 hours
        raise self.retry(exc=exc, countdown=7200)


@shared_task
def update_site_statistics() -> Dict[str, Any]:
    """
    Update site-wide statistics for dashboard display.

    Calculates and caches:
    - Total works count
    - Total screen works count
    - Total adaptations (edges) count
    - Total diffs count
    - Total users count
    - Active users (logged in last 30 days)

    Returns:
        dict: All calculated statistics
    """
    logger.info("Updating site statistics")

    try:
        stats = {
            'total_works': Work.objects.count(),
            'total_screen_works': ScreenWork.objects.count(),
            'total_adaptations': AdaptationEdge.objects.count(),
            'total_diffs': DiffItem.objects.count(),
            'total_users': User.objects.count(),
            'active_users_30d': User.objects.filter(
                last_login__gte=timezone.now() - timedelta(days=30)
            ).count(),
            'works_by_type': {
                'movies': ScreenWork.objects.filter(type='MOVIE').count(),
                'tv_series': ScreenWork.objects.filter(type='TV').count(),
            },
            'timestamp': timezone.now().isoformat(),
        }

        # Cache for 24 hours
        cache.set('site_statistics', stats, timeout=86400)

        logger.info(f"Site statistics updated: {stats}")

        return stats

    except Exception as e:
        logger.error(f"Failed to update site statistics: {e}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
        }


@shared_task
def cleanup_expired_sessions() -> Dict[str, Any]:
    """
    Clean up expired Django sessions.

    Removes session records that have expired to keep the database clean.

    Returns:
        dict: Number of sessions deleted
    """
    logger.info("Cleaning up expired sessions")

    try:
        # Delete all expired sessions
        deleted_count, _ = Session.objects.filter(
            expire_date__lt=timezone.now()
        ).delete()

        logger.info(f"Deleted {deleted_count} expired sessions")

        return {
            'status': 'success',
            'deleted_count': deleted_count,
            'timestamp': timezone.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Failed to clean up sessions: {e}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
        }


@shared_task
def cleanup_expired_jwt_tokens() -> Dict[str, Any]:
    """
    Clean up expired JWT tokens from the blacklist.

    Removes old OutstandingToken and BlacklistedToken records to prevent
    the token tables from growing indefinitely.

    Returns:
        dict: Number of tokens deleted
    """
    logger.info("Cleaning up expired JWT tokens")

    stats = {
        'outstanding_deleted': 0,
        'blacklisted_deleted': 0,
    }

    try:
        # Delete expired outstanding tokens
        cutoff_time = timezone.now() - timedelta(days=30)  # Keep 30 days of history

        outstanding_deleted, _ = OutstandingToken.objects.filter(
            expires_at__lt=cutoff_time
        ).delete()
        stats['outstanding_deleted'] = outstanding_deleted

        # Blacklisted tokens are deleted automatically when their associated
        # OutstandingToken is deleted due to CASCADE

        logger.info(
            f"Deleted {stats['outstanding_deleted']} expired outstanding tokens"
        )

        return {
            'status': 'success',
            'timestamp': timezone.now().isoformat(),
            **stats
        }

    except Exception as e:
        logger.error(f"Failed to clean up JWT tokens: {e}", exc_info=True)
        return {
            'status': 'error',
            'error': str(e),
            'timestamp': timezone.now().isoformat(),
        }


@shared_task
def cleanup_old_celery_results() -> Dict[str, Any]:
    """
    Clean up old Celery task results from Redis.

    This is a placeholder for when you want to implement custom cleanup logic
    for task results. By default, Celery expires results based on CELERY_RESULT_EXPIRES.

    Returns:
        dict: Cleanup statistics
    """
    logger.info("Celery result cleanup - handled by CELERY_RESULT_EXPIRES setting")

    return {
        'status': 'success',
        'message': 'Results auto-expire per CELERY_RESULT_EXPIRES setting',
        'timestamp': timezone.now().isoformat(),
    }


@shared_task(bind=True)
def health_check(self) -> Dict[str, Any]:
    """
    Simple health check task to verify Celery is working.

    Can be called manually or scheduled to ensure worker is responsive.

    Returns:
        dict: Health check status
    """
    return {
        'status': 'healthy',
        'task_id': self.request.id,
        'timestamp': timezone.now().isoformat(),
    }
