# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wps', '0001_initial'),
        ('decat_geonode', '0011_hazardmodelrun_impact_assessment_creator'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='wps',
            field=models.ForeignKey(blank=True, to='wps.WebProcessingServiceRun', null=True),
        ),
    ]
