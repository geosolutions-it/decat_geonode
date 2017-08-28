# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WebProcessingServiceExecutionOutput',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=255, null=True, blank=True)),
                ('abstract', models.TextField(null=True)),
                ('identifier', models.CharField(max_length=4096, null=True, blank=True)),
                ('execution', models.ForeignKey(to='wps.WebProcessingServiceExecution')),
            ],
        ),
        migrations.AddField(
            model_name='webprocessingserviceexecution',
            name='processOutputs',
            field=models.ManyToManyField(to='wps.WebProcessingServiceExecutionOutput', blank=True),
        ),
    ]
