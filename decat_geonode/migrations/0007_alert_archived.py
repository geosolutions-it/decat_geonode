# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0006_promoted_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardalert',
            name='archived',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='archived_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='archived',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='archived_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
