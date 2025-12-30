"""Management command to add screen posters."""
from django.core.management.base import BaseCommand
from screen.models import ScreenWork


class Command(BaseCommand):
    """Add or update a screen poster URL."""

    help = 'Add or update a screen poster URL'

    def add_arguments(self, parser):
        parser.add_argument('screen_id', type=int, help='Screen ID')
        parser.add_argument('poster_url', type=str, help='Poster image URL')

    def handle(self, *args, **options):
        screen_id = options['screen_id']
        poster_url = options['poster_url']

        try:
            screen = ScreenWork.objects.get(id=screen_id)
            screen.poster_url = poster_url
            screen.save()

            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Updated poster for "{screen.title}" ({screen.year})\n'
                    f'  URL: {poster_url}'
                )
            )
        except ScreenWork.DoesNotExist:
            self.stderr.write(
                self.style.ERROR(f'Screen with ID {screen_id} not found')
            )
