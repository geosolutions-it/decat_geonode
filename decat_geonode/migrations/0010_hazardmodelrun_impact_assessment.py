# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0009_hazardmodels'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='impact_assessment',
            field=models.ForeignKey(blank=True, to='decat_geonode.ImpactAssessment', null=True),
        ),
    ]
