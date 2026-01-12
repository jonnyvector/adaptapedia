#!/bin/bash
# Script to enrich book covers in production
python manage.py enrich_book_covers --all-missing
