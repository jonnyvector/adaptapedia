# Generated manually - add genres field and populate from TMDb

from django.db import migrations, models


def add_genres_field_if_not_exists(apps, schema_editor):
    """Add genres field only if it doesn't exist, then populate from TMDb."""
    # Check if column exists and add if not
    schema_editor.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='works_work' AND column_name='genres'
            ) THEN
                ALTER TABLE works_work ADD COLUMN genres JSONB DEFAULT '[]'::jsonb;
            END IF;
        END $$;
    """)

    # Populate genres from TMDb
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
    schema_editor.execute("UPDATE works_work SET genres = '[]'::jsonb;")


class Migration(migrations.Migration):

    dependencies = [
        ('works', '0004_work_average_rating_work_ratings_count'),
        ('screen', '0001_initial'),  # Ensure screen models exist
    ]

    operations = [
        migrations.RunPython(add_genres_field_if_not_exists, reverse_populate),
    ]
