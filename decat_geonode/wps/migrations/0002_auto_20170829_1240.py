# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='webprocessingserviceexecution',
            name='percent_completed',
            field=models.DecimalField(default=0.0, null=True, max_digits=11, decimal_places=2, blank=True),
        ),
    ]
