# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0002_auto_20170829_1240'),
    ]

    operations = [
        migrations.AddField(
            model_name='webprocessingservicerun',
            name='output_hook',
            field=models.CharField(max_length=200, null=True, verbose_name='output hook', blank=True),
        ),
    ]
