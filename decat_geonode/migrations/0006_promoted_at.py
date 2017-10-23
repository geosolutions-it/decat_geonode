# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0005_map_config'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardalert',
            name='promoted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='promoted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
