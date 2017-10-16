# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0018_merge'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnnotationMapGlobal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('hazard', models.ForeignKey(related_name='annotations', to='decat_geonode.HazardAlert')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
