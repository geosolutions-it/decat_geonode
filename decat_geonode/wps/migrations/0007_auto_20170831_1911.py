# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0006_geojsonwrapperhook_webprocessingserviceexecutionoutputhook'),
    ]

    operations = [
        migrations.AlterField(
            model_name='webprocessingserviceexecutionoutputhook',
            name='name',
            field=models.CharField(unique=True, max_length=200),
        ),
    ]
