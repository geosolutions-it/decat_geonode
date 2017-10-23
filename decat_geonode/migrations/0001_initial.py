# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('base', '26_to_27'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlertLevel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=255)),
                ('description', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='AlertSource',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=255)),
                ('uri', models.TextField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='AlertSourceType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=255)),
                ('description', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='HazardAlert',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('reported_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='HazardType',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(unique=True, max_length=255)),
                ('description', models.CharField(max_length=255)),
                ('icon', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='HistoricalHazardAlert',
            fields=[
                ('id', models.IntegerField(verbose_name='ID', db_index=True, auto_created=True, blank=True)),
                ('geometry', django.contrib.gis.db.models.fields.GeometryField(srid=4326)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(editable=False, blank=True)),
                ('updated_at', models.DateTimeField(editable=False, blank=True)),
                ('description', models.TextField(default=b'', blank=True)),
                ('reported_at', models.DateTimeField(editable=False, blank=True)),
                ('history_id', models.AutoField(serialize=False, primary_key=True)),
                ('history_date', models.DateTimeField()),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(max_length=1, choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')])),
                ('hazard_type', models.ForeignKey(related_name='+', on_delete=django.db.models.deletion.DO_NOTHING, db_constraint=False, blank=True, to='decat_geonode.HazardType', null=True)),
                ('history_user', models.ForeignKey(related_name='+', on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL, null=True)),
                ('level', models.ForeignKey(related_name='+', on_delete=django.db.models.deletion.DO_NOTHING, db_constraint=False, blank=True, to='decat_geonode.AlertLevel', null=True)),
                ('source', models.ForeignKey(related_name='+', on_delete=django.db.models.deletion.DO_NOTHING, db_constraint=False, blank=True, to='decat_geonode.AlertSource', null=True)),
            ],
            options={
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': 'history_date',
                'verbose_name': 'historical hazard alert',
            },
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='hazard_type',
            field=models.ForeignKey(to='decat_geonode.HazardType'),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='level',
            field=models.ForeignKey(to='decat_geonode.AlertLevel'),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='regions',
            field=models.ManyToManyField(to='base.Region'),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='source',
            field=models.ForeignKey(to='decat_geonode.AlertSource'),
        ),
        migrations.AddField(
            model_name='alertsource',
            name='type',
            field=models.ForeignKey(to='decat_geonode.AlertSourceType'),
        ),
    ]
