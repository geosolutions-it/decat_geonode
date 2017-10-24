# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0019_annotationmapglobal'),
    ]

    operations = [
        migrations.AddField(
            model_name='annotationmapglobal',
            name='style',
            field=models.TextField(null=True),
        ),
    ]
