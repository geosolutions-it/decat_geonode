# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('decat_geonode', '0003_decat_data_scope'),
    ]

    operations = [
        migrations.AlterField(
            model_name='groupdatascope',
            name='group',
            field=models.OneToOneField(related_name='data_scope', to='groups.GroupProfile'),
        ),
    ]
