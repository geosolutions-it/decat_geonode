# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0008_impactassessment'),
    ]

    operations = [
        migrations.AddField(
            model_name='impactassessment',
            name='promoted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='impactassessment',
            name='promoted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
