# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('maps', '0025_auto_20170801_1228'),
        ('decat_geonode', '0007_alert_archived'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImpactAssessment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('hazard', models.ForeignKey(to='decat_geonode.HazardAlert')),
                ('map', models.ForeignKey(blank=True, to='maps.Map', null=True)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
