# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0020_annotationmapglobal_style'),
    ]

    operations = [
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
