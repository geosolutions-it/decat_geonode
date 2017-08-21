# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0010_hazardmodelrun_impact_assessment'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='creator',
            field=models.ForeignKey(related_name='created_by', to=settings.AUTH_USER_MODEL, blank=True, null=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='hazardmodelrun',
            name='last_editor',
            field=models.ForeignKey(related_name='last_edited_by', to=settings.AUTH_USER_MODEL, blank=True, null=True),
            preserve_default=False,
        ),
    ]
