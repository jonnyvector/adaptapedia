#!/bin/bash
# Check production database for comparisons

echo "Checking for screen works..."
railway run --service impartial-tranquility python3 manage.py shell -c "
from screen.models import ScreenWork
from works.models import Work
from diffs.models import DiffItem

screen_count = ScreenWork.objects.count()
work_count = Work.objects.count()
diff_count = DiffItem.objects.count()

print(f'Works (books): {work_count}')
print(f'Screen works: {screen_count}')
print(f'Diffs: {diff_count}')

if diff_count > 0:
    print('\nSample diffs:')
    for diff in DiffItem.objects.all()[:5]:
        print(f'  - {diff.claim[:50]}...')
"
