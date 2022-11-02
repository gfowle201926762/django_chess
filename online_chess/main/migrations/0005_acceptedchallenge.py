# Generated by Django 4.1 on 2022-08-19 10:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0004_userprofile_challengers_userprofile_challenging"),
    ]

    operations = [
        migrations.CreateModel(
            name="AcceptedChallenge",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("accepted", models.BooleanField(default=False)),
                (
                    "challenged",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="challenged",
                        to="main.userprofile",
                    ),
                ),
                (
                    "challenger",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="challenger",
                        to="main.userprofile",
                    ),
                ),
            ],
        ),
    ]
