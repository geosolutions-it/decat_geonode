# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0008_unzipdownloadhook_unzipfilehook_urldownloadhook_urlfixhook'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShapefileDownloadHook',
            fields=[
                ('webprocessingserviceexecutionoutputhook_ptr', models.OneToOneField(parent_link=True, auto_created=True, primary_key=True, serialize=False, to='wps.WebProcessingServiceExecutionOutputHook')),
            ],
            bases=('wps.webprocessingserviceexecutionoutputhook',),
        ),
    ]
