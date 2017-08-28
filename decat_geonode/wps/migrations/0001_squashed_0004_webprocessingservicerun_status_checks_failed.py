# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import decat_geonode.wps.validators


class Migration(migrations.Migration):

    replaces = [(b'wps', '0001_initial'), (b'wps', '0002_auto_20170825_1917'), (b'wps', '0003_auto_20170825_1946'), (b'wps', '0004_webprocessingservicerun_status_checks_failed')]

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WebProcessingServiceExecution',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('request', models.TextField(null=True, blank=True)),
                ('response', models.TextField(null=True, blank=True)),
                ('status_location', models.CharField(max_length=4096, null=True, blank=True)),
                ('status', models.CharField(max_length=255, null=True, blank=True)),
                ('percent_completed', models.DecimalField(default=0.0, null=True, max_digits=3, decimal_places=2, blank=True)),
                ('completed', models.BooleanField(default=False)),
                ('successful', models.BooleanField(default=False)),
                ('failed', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='WebProcessingServiceExecutionError',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.TextField(null=True, blank=True)),
                ('code', models.CharField(max_length=255, null=True, blank=True)),
                ('locator', models.CharField(max_length=4096, null=True, blank=True)),
                ('execution', models.ForeignKey(to='wps.WebProcessingServiceExecution')),
            ],
        ),
        migrations.CreateModel(
            name='WebProcessingServiceRun',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('identifier', models.CharField(max_length=255)),
                ('title', models.TextField(default=b'', blank=True)),
                ('abstract', models.TextField(default=b'', blank=True)),
                ('username', models.CharField(max_length=255, null=True, blank=True)),
                ('password', models.CharField(max_length=255, null=True, blank=True)),
                ('url', models.CharField(max_length=4096)),
                ('version', models.CharField(max_length=255)),
                ('service_instance', models.CharField(default=b'', max_length=4096, blank=True)),
                ('request_template', models.FileField(upload_to=b'wpsrequests/%Y/%m/%d', validators=[decat_geonode.wps.validators.validate_file_extension])),
                ('execution', models.ForeignKey(blank=True, to='wps.WebProcessingServiceExecution', null=True)),
                ('status_checks_failed', models.IntegerField(default=0)),
            ],
        ),
        migrations.AddField(
            model_name='webprocessingserviceexecution',
            name='errors',
            field=models.ManyToManyField(to=b'wps.WebProcessingServiceExecutionError', blank=True),
        ),
        migrations.AddField(
            model_name='webprocessingserviceexecution',
            name='process',
            field=models.ForeignKey(to='wps.WebProcessingServiceRun'),
        ),
        migrations.CreateModel(
            name='WebProcessingServiceExecutionOutput',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=255, null=True, blank=True)),
                ('abstract', models.TextField(null=True, blank=True)),
                ('identifier', models.CharField(max_length=4096, null=True, blank=True)),
                ('execution', models.ForeignKey(to='wps.WebProcessingServiceExecution')),
                ('data', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.AddField(
            model_name='webprocessingserviceexecution',
            name='processOutputs',
            field=models.ManyToManyField(to=b'wps.WebProcessingServiceExecutionOutput', blank=True),
        ),
    ]
