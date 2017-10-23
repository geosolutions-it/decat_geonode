# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('maps', '24_initial'),
        ('decat_geonode', '0004_data_scope_group'),
    ]

    operations = [
        migrations.CreateModel(
            name='RoleMapConfig',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('role', models.CharField(max_length=64, choices=[(b'', 'No role'), (b'event-operator', 'Event Operator'), (b'impact-assessor', 'Impact Assessor'), (b'emergency-manager', 'Emergency Manager')])),
                ('map', models.ForeignKey(to='maps.Map')),
                ('user', models.ForeignKey(related_name='decat_maps', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
