# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0016_hazardmodelrun_hazard'),
    ]

    operations = [
        migrations.AlterField(
            model_name='impactassessment',
            name='hazard',
            field=models.ForeignKey(related_name='assessments', to='decat_geonode.HazardAlert'),
        ),
    ]
