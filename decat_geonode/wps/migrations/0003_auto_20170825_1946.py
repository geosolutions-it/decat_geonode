# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0002_auto_20170825_1917'),
    ]

    operations = [
        migrations.AddField(
            model_name='webprocessingserviceexecutionoutput',
            name='data',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='webprocessingserviceexecutionerror',
            name='text',
            field=models.TextField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='webprocessingserviceexecutionoutput',
            name='abstract',
            field=models.TextField(null=True, blank=True),
        ),
    ]
