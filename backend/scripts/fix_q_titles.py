#!/usr/bin/env python
"""Fix Q-number titles by fetching real titles from Wikidata."""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adaptapedia.settings.development')
django.setup()

from ingestion.openlibrary import enrich_work_from_openlibrary
from works.models import Work
import re

# Find all books with Q-number titles
q_books = Work.objects.filter(title__regex=r'^Q[0-9]+$')
total = q_books.count()

print(f'Enriching {total} Q-number books...\n')

success = 0
titles_fixed = 0
errors = 0

for i, work in enumerate(q_books, 1):
    old_title = work.title
    print(f'[{i}/{total}] {old_title}', end='')

    try:
        result = enrich_work_from_openlibrary(work.id)

        work.refresh_from_db()
        if work.title != old_title:
            titles_fixed += 1
            print(f' → {work.title}')
        else:
            print(' (title unchanged)')

        if result.get('success'):
            success += 1
    except Exception as e:
        errors += 1
        print(f' ERROR: {e}')

print(f'\nDone!')
print(f'  Titles fixed: {titles_fixed}/{total}')
print(f'  Full enrichments: {success}')
print(f'  Errors: {errors}')
