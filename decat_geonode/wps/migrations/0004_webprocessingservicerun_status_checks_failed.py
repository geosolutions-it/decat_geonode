# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0003_auto_20170825_1946'),
    ]

    operations = [
        migrations.AddField(
            model_name='webprocessingservicerun',
            name='status_checks_failed',
            field=models.IntegerField(default=0),
        ),
    ]
