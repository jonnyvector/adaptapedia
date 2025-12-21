# Generated manually for comparison-first search feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("screen", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="screenwork",
            name="tmdb_popularity",
            field=models.FloatField(
                default=0.0,
                db_index=True,
                help_text="TMDb popularity score for ranking",
            ),
        ),
    ]
