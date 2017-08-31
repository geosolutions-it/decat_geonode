# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0005_delete_webprocessingserviceexecutionoutputhook'),
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
        migrations.CreateModel(
            name='GeoJsonWrapperHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
    ]
