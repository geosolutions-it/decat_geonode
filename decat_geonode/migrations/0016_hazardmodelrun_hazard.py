# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0015_auto_20170831_1924'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='hazard',
            field=models.ForeignKey(blank=True, to='decat_geonode.HazardAlert', null=True),
        ),
    ]
