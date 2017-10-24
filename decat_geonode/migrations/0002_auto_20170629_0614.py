# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardalert',
            name='promoted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='promoted',
            field=models.BooleanField(default=False),
        ),
    ]
