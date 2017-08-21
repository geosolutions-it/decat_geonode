# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0011_auto_20170821_1605'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hazardmodelrun',
            name='creator',
            field=models.ForeignKey(related_name='created_by', default=None, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='hazardmodelrun',
            name='last_editor',
            field=models.ForeignKey(related_name='last_edited_by', default=None, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
