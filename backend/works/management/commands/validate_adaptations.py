"""Validate book-to-screen adaptation pairings for quality issues."""
from django.core.management.base import BaseCommand
from screen.models import AdaptationEdge
from django.db.models import Q


class Command(BaseCommand):
    help = 'Validate adaptation pairings and identify suspicious matches'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Automatically delete suspicious pairings',
        )
        parser.add_argument(
            '--limit',
            type=int,
            help='Limit number of pairings to check',
        )

    def handle(self, *args, **options):
        fix_mode = options.get('fix')
        limit = options.get('limit')

        edges = AdaptationEdge.objects.select_related('work', 'screen_work').all()

        if limit:
            edges = edges[:limit]

        total = edges.count()
        self.stdout.write(f'Checking {total} adaptation pairings...\n')

        suspicious = []
        stats = {
            'government_docs': 0,
            'academic_papers': 0,
            'year_mismatch': 0,
            'title_similarity': 0,
        }

        for edge in edges:
            book = edge.work
            screen = edge.screen_work
            issues = []

            # Check 1: Government documents / legislative materials
            if book.author:
                author_lower = book.author.lower()
                if any(keyword in author_lower for keyword in [
                    'congress', 'senate', 'house of representatives', 'committee',
                    'united states.', 'government printing', 'h.r.', 's.',
                    'public law', 'u.s. code', 'federal register',
                    'subcommittee', 'congressional'
                ]) or book.title.startswith('H.R.') or book.title.startswith('S.'):
                    issues.append('Government/legislative document')
                    stats['government_docs'] += 1

            # Check 2: Academic/technical papers
            if book.author and any(keyword in book.author.lower() for keyword in [
                'university', 'institute', 'association', 'society for'
            ]):
                issues.append('Academic/institutional author')
                stats['academic_papers'] += 1

            # Check 3: Year mismatch (book published after movie/show)
            if book.year and screen.year:
                if book.year > screen.year + 1:  # Allow 1 year for novelizations
                    issues.append(f'Book year ({book.year}) after screen year ({screen.year})')
                    stats['year_mismatch'] += 1

            # Check 4: Title similarity
            book_title_normalized = book.title.lower().strip()
            screen_title_normalized = screen.title.lower().strip()

            # For numeric titles, require exact match
            if book_title_normalized.isdigit() and screen_title_normalized.isdigit():
                if book_title_normalized != screen_title_normalized:
                    issues.append(f'Numeric title mismatch: "{book.title}" vs "{screen.title}"')
                    stats['title_similarity'] += 1

            if issues:
                suspicious.append({
                    'edge_id': edge.id,
                    'book_id': book.id,
                    'book_title': book.title,
                    'book_author': book.author or '(no author)',
                    'book_year': book.year or '?',
                    'screen_id': screen.id,
                    'screen_title': screen.title,
                    'screen_year': screen.year or '?',
                    'issues': issues,
                })

        # Report suspicious pairings
        if suspicious:
            self.stdout.write(self.style.WARNING(f'\nFound {len(suspicious)} suspicious pairings:\n'))

            for item in suspicious[:20]:  # Show first 20
                self.stdout.write('─' * 70)
                self.stdout.write(f'\nBook: {item["book_title"]} ({item["book_year"]})')
                self.stdout.write(f'  Author: {item["book_author"]}')
                self.stdout.write(f'  ID: {item["book_id"]}')
                self.stdout.write(f'\nScreen: {item["screen_title"]} ({item["screen_year"]})')
                self.stdout.write(f'  ID: {item["screen_id"]}')
                self.stdout.write(f'\nIssues:')
                for issue in item['issues']:
                    self.stdout.write(f'  • {issue}')
                self.stdout.write(f'\nEdge ID: {item["edge_id"]}')
                self.stdout.write('')

            if len(suspicious) > 20:
                self.stdout.write(f'\n... and {len(suspicious) - 20} more\n')

            # Auto-fix government documents
            if fix_mode:
                gov_doc_edges = [s for s in suspicious if 'Government document' in str(s['issues'])]
                if gov_doc_edges:
                    self.stdout.write(f'\n{self.style.WARNING("Deleting government document pairings...")}')
                    for item in gov_doc_edges:
                        AdaptationEdge.objects.filter(id=item['edge_id']).delete()
                        self.stdout.write(f'  ✓ Deleted edge {item["edge_id"]}: {item["screen_title"]} → {item["book_title"]}')

        else:
            self.stdout.write(self.style.SUCCESS('\nNo suspicious pairings found!'))

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS('\nValidation Summary:'))
        self.stdout.write(f'  Total checked: {total}')
        self.stdout.write(f'  Suspicious: {len(suspicious)}')
        self.stdout.write(f'\nIssue breakdown:')
        self.stdout.write(f'  Government docs: {stats["government_docs"]}')
        self.stdout.write(f'  Academic papers: {stats["academic_papers"]}')
        self.stdout.write(f'  Year mismatches: {stats["year_mismatch"]}')
        self.stdout.write(f'  Title mismatches: {stats["title_similarity"]}')
        self.stdout.write('=' * 70)
