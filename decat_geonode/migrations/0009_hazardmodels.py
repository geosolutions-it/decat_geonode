# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0027_auto_20170801_1228'),
        ('decat_geonode', '0008_impactassessment'),
    ]

    operations = [
        migrations.CreateModel(
            name='HazardModel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('name', models.CharField(max_length=255)),
                ('uri', models.TextField(null=True, blank=True)),
                ('runnable', models.BooleanField(default=False)),
                ('hazard_type', models.ForeignKey(to='decat_geonode.HazardType')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='HazardModelIO',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('identifier', models.CharField(max_length=255)),
                ('label', models.TextField(default=b'')),
                ('description', models.TextField(default=b'')),
                ('myme_type', models.CharField(default=b'text/plain', max_length=255)),
                ('type', models.CharField(default=b'literal', max_length=20, choices=[(b'literal', b'Literal'), (b'number', b'Number'), (b'boolean', b'Boolean'), (b'date', b'Date'), (b'time', b'Time'), (b'datetime', b'DateTime'), (b'gn_layer', b'GeoNode Layer'), (b'gn_document', b'GeoNode Document')])),
                ('min_occurrencies', models.PositiveIntegerField()),
                ('max_occurrencies', models.PositiveIntegerField()),
                ('uploaded', models.BooleanField(default=False)),
                ('data', models.TextField(null=True, blank=True)),
                ('meta', models.TextField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='HazardModelRun',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('name', models.CharField(max_length=255)),
                ('hazard_model', models.ForeignKey(to='decat_geonode.HazardModel')),
                ('inputs', models.ManyToManyField(related_name='run_inputs', to='decat_geonode.HazardModelIO', blank=True)),
                ('outputs', models.ManyToManyField(related_name='run_outputs', to='decat_geonode.HazardModelIO', blank=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='hazardmodel',
            name='inputs',
            field=models.ManyToManyField(related_name='model_inputs', to='decat_geonode.HazardModelIO', blank=True),
        ),
        migrations.AddField(
            model_name='hazardmodel',
            name='outputs',
            field=models.ManyToManyField(related_name='model_outputs', to='decat_geonode.HazardModelIO', blank=True),
        ),
        migrations.AddField(
            model_name='hazardmodel',
            name='regions',
            field=models.ManyToManyField(to='base.Region', blank=True),
        ),
    ]
