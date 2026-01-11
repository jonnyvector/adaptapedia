# Generated manually - add genres field and populate from TMDb

from django.db import migrations, models


def populate_genres_from_tmdb(apps, schema_editor):
    """Populate work genres from screen adaptation TMDb genres."""
    # Use raw SQL for efficiency
    schema_editor.execute("""
        UPDATE works_work w
        SET genres = s.genres
        FROM screen_adaptationedge ae
        JOIN screen_screenwork s ON ae.screen_work_id = s.id
        WHERE ae.work_id = w.id
        AND s.genres IS NOT NULL
        AND s.genres::text <> '[]';
    """)


def reverse_populate(apps, schema_editor):
    """Clear genres field on reverse."""
    Work = apps.get_model('works', 'Work')
    Work.objects.all().update(genres=[])


class Migration(migrations.Migration):

    dependencies = [
        ('works', '0004_work_average_rating_work_ratings_count'),
        ('screen', '0001_initial'),  # Ensure screen models exist
    ]

    operations = [
        migrations.AddField(
            model_name='work',
            name='genres',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(populate_genres_from_tmdb, reverse_populate),
    ]
