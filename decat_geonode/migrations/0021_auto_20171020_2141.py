# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0020_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='annotationmapglobal',
            name='style',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='closed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='closed_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='closed_reason',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='hazardalert',
            name='other_notes',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='closed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='closed_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='closed_reason',
            field=models.TextField(null=True),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='other_notes',
            field=models.TextField(null=True),
        ),
        migrations.AlterField(
            model_name='annotationmapglobal',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='hazardalert',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='hazardmodel',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='hazardmodelrun',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='historicalhazardalert',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='impactassessment',
            name='description',
            field=models.TextField(default=b'', null=True, blank=True),
        ),
    ]
