#!/bin/bash
# Entrypoint script for Railway deployment

set -e

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn..."
exec gunicorn adaptapedia.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 60
