# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0016_hazardmodelrun_hazard'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardalert',
            name='last_cop_at',
            field=models.DateTimeField(null=True, blank=None),
        ),
        migrations.AddField(
            model_name='historicalhazardalert',
            name='last_cop_at',
            field=models.DateTimeField(null=True, blank=None),
        ),
        migrations.AlterField(
            model_name='impactassessment',
            name='hazard',
            field=models.ForeignKey(related_name='assessments', to='decat_geonode.HazardAlert'),
        ),
    ]
