"""Management command to normalize existing genres to standard categories."""
from django.core.management.base import BaseCommand
from works.models import Work


# Standard genres we want to keep
VALID_GENRES = {
    'Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller',
    'Horror', 'Romance', 'Historical Fiction', 'Adventure',
    'Young Adult', 'Children\'s Literature', 'Drama', 'Comedy',
    'Dystopian', 'Biography', 'Non-Fiction', 'Graphic Novel',
    'Poetry', 'Short Stories', 'Classic Literature'
}

# Comprehensive genre normalization mapping
GENRE_MAPPING = {
    # Fiction variants
    'fiction': 'Fiction',
    'Fiction': 'Fiction',
    'Ficción': 'Fiction',
    'novels': 'Fiction',
    'domestic fiction': 'Fiction',
    'Fiction, general': 'Fiction',
    'Fiction, historical, general': 'Historical Fiction',
    'Fiction, Romance, Contemporary': 'Romance',
    'Fiction, Romance, Historical, Regency': 'Romance',
    'Fiction, romance, general': 'Romance',
    'Fiction, thrillers, espionage': 'Thriller',
    'Fiction, psychological': 'Thriller',
    'Fiction, Historical': 'Historical Fiction',
    'Paris (france), fiction': 'Fiction',
    'Man-woman relationships, fiction': 'Romance',
    'Historical Fiction': 'Historical Fiction',

    # Science Fiction variants
    'Science Fiction': 'Science Fiction',
    'science fiction': 'Science Fiction',
    'Ciencia-ficción': 'Science Fiction',
    'American Science fiction': 'Science Fiction',
    'Comics & graphic novels, science fiction': 'Graphic Novel',

    # Fantasy variants
    'Fantasy': 'Fantasy',
    'Fantasy fiction': 'Fantasy',
    'Fantasy fiction, English': 'Fantasy',
    'American Fantasy fiction': 'Fantasy',
    'Fiction, fantasy, general': 'Fantasy',
    'Comic fantasy': 'Fantasy',
    'Fantasy comic books, strips': 'Graphic Novel',

    # Mystery/Thriller variants
    'Mystery': 'Mystery',
    'mystery': 'Mystery',
    'Detective and mystery stories': 'Mystery',
    'Mystery and detective stories': 'Mystery',
    'English Detective and mystery stories': 'Mystery',
    'American Detective and mystery stories': 'Mystery',
    'FICTION / Mystery & Detective / General': 'Mystery',
    'Comics & graphic novels, crime & mystery': 'Graphic Novel',
    'suspense': 'Thriller',
    'Thriller': 'Thriller',
    'Suspense & Thriller': 'Thriller',

    # Horror variants
    'Horror': 'Horror',
    'YA Horror': 'Horror',
    'English Ghost stories': 'Horror',

    # Children's/YA variants
    'Children\'s fiction': 'Children\'s Literature',
    'Children\'s Literature': 'Children\'s Literature',
    'Juvenile literature': 'Children\'s Literature',
    'Children\'s stories, English': 'Children\'s Literature',
    'Children\'s audiobooks': 'Children\'s Literature',
    'Picture books': 'Children\'s Literature',
    'Board books': 'Children\'s Literature',
    'Children: Grades 1-2': 'Children\'s Literature',
    'Children\'s Books/Ages 9-12 Fiction': 'Children\'s Literature',
    'Juvenile Fiction': 'Young Adult',
    'Juvenile fiction': 'Young Adult',
    'Young Adult Fiction': 'Young Adult',
    'Young adult fiction': 'Young Adult',
    'Juvenile Fiction - Family - Siblings': 'Young Adult',

    # Graphic Novel variants
    'Graphic Novel': 'Graphic Novel',
    'Graphic novels': 'Graphic Novel',
    'Comics & graphic novels, general': 'Graphic Novel',
    'Comics & graphic novels, horror': 'Graphic Novel',
    'Comics & graphic novels, fantasy': 'Graphic Novel',
    'Comics & graphic novels, manga, general': 'Graphic Novel',
    'Comic books, strips': 'Graphic Novel',
    'Superhero comic books, strips': 'Graphic Novel',
    'Bandes dessinées': 'Graphic Novel',
    'Caricatures and cartoons': 'Graphic Novel',

    # Drama variants
    'Drama': 'Drama',
    'Operas': 'Drama',
    'Opera': 'Drama',
    'Librettos': 'Drama',
    'Libretto': 'Drama',
    'Vocal music': 'Drama',
    'Continental european drama (dramatic works by one author)': 'Drama',

    # Romance variants
    'Romance': 'Romance',
    'Romance literature': 'Romance',

    # Adventure variants
    'Adventure': 'Adventure',
    'Adventure stories': 'Adventure',

    # Biography variants
    'Biography': 'Biography',

    # Classic Literature variants
    'Classic Literature': 'Classic Literature',
    'French literature': 'Classic Literature',
    'Bildungsromans': 'Classic Literature',

    # School stories map to YA
    'School stories': 'Young Adult',

    # Everything else is NOT a genre and should be cleared
    # (This is a comprehensive list of non-genre subjects)
}


class Command(BaseCommand):
    help = 'Normalize existing genres to standard categories'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would change without saving',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run')

        # Get all works with genres
        works = Work.objects.exclude(genre='').exclude(genre__isnull=True)
        total = works.count()

        self.stdout.write(f'Processing {total} books with genres...\n')

        updated = 0
        unchanged = 0
        cleared = 0

        changes = {}  # Track changes for summary

        for work in works:
            old_genre = work.genre

            # Check if it's in our mapping
            if old_genre in GENRE_MAPPING:
                new_genre = GENRE_MAPPING[old_genre]
            # If not mapped, only keep if it's a valid standard genre
            elif old_genre in VALID_GENRES:
                new_genre = old_genre
            # Otherwise, clear it (it's not a real genre)
            else:
                new_genre = ''

            if new_genre != old_genre:
                if dry_run:
                    change_key = f'"{old_genre}" -> "{new_genre}"'
                    changes[change_key] = changes.get(change_key, 0) + 1
                else:
                    work.genre = new_genre
                    work.save(update_fields=['genre'])

                if new_genre == '':
                    cleared += 1
                else:
                    updated += 1
            else:
                unchanged += 1

        # Summary
        self.stdout.write('\n' + '=' * 70)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total processed: {total}')
        self.stdout.write(self.style.SUCCESS(f'  Updated: {updated}'))
        self.stdout.write(self.style.WARNING(f'  Cleared (non-genres): {cleared}'))
        self.stdout.write(f'  Unchanged: {unchanged}')

        if dry_run and changes:
            self.stdout.write('\n' + '=' * 70)
            self.stdout.write(self.style.WARNING('\nChanges that would be made:'))
            for change, count in sorted(changes.items(), key=lambda x: -x[1]):
                self.stdout.write(f'  [{count:3d}] {change}')

        if dry_run:
            self.stdout.write('\n' + self.style.WARNING('DRY RUN - No changes were saved'))
        else:
            self.stdout.write('\n' + self.style.SUCCESS('Genres normalized successfully!'))
