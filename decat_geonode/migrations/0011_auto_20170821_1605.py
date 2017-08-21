# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import cuser.fields


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('decat_geonode', '0010_hazardmodelrun_impact_assessment'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodelrun',
            name='creator',
            field=cuser.fields.CurrentUserField(related_name='created_runs', editable=False, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='hazardmodelrun',
            name='last_editor',
            field=cuser.fields.CurrentUserField(related_name='last_edited_runs', editable=False, to=settings.AUTH_USER_MODEL, null=True),
        ),
    ]
