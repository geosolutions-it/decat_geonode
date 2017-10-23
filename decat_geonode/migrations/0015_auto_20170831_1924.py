# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0014_hazardmodelrun_output_hook'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hazardmodelrun',
            name='output_hook',
        ),
        migrations.AddField(
            model_name='hazardmodel',
            name='output_hook',
            field=models.CharField(max_length=200, null=True, verbose_name='output hook', blank=True),
        ),
    ]
