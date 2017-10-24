# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0012_hazardmodelrun_wps'),
    ]

    operations = [
        migrations.AddField(
            model_name='hazardmodel',
            name='request_template',
            field=models.FileField(null=True, upload_to=b'', blank=True),
        ),
    ]
