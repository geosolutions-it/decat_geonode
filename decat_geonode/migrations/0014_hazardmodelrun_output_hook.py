# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0013_hazardmodel_request_template'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='output_hook',
            field=models.CharField(max_length=200, null=True, verbose_name='output hook', blank=True),
        ),
    ]
