# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0003_webprocessingservicerun_output_hook'),
    ]

    operations = [
        migrations.CreateModel(
            name='WebProcessingServiceExecutionOutputHook',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
                ('description', models.TextField(null=True, blank=True)),
            ],
        ),
    ]
