# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0007_auto_20170831_1911'),
    ]

    operations = [
        migrations.CreateModel(
            name='UnzipDownloadHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
        migrations.CreateModel(
            name='UnzipFileHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
        migrations.CreateModel(
            name='UrlDownloadHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
        migrations.CreateModel(
            name='UrlFixHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
    ]
