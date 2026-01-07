#!/bin/bash
# One-time migration script for Railway deployment

echo "Running database migrations..."
python manage.py migrate

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Migrations complete!"
