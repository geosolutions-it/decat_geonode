# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('base', '26_to_27'),
        ('groups', '26_to_27'),
        ('decat_geonode', '0002_auto_20170629_0614'),
    ]

    operations = [
        migrations.CreateModel(
            name='GroupDataScope',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('alert_levels', models.ManyToManyField(related_name='data_scope', to='decat_geonode.AlertLevel', blank=True)),
                ('categories', models.ManyToManyField(related_name='data_scope', to='base.TopicCategory', blank=True)),
                ('group', models.ForeignKey(related_name='data_scope', to='groups.GroupProfile')),
                ('hazard_types', models.ManyToManyField(related_name='data_scope', to='decat_geonode.HazardType', blank=True)),
                ('keywords', models.ManyToManyField(related_name='data_scope', to='base.ThesaurusKeyword', blank=True)),
                ('not_alert_levels', models.ManyToManyField(related_name='data_scope_exclude', to='decat_geonode.AlertLevel', blank=True)),
                ('not_categories', models.ManyToManyField(related_name='data_scope_exclude', to='base.TopicCategory', blank=True)),
                ('not_hazard_types', models.ManyToManyField(related_name='data_scope_exclude', to='decat_geonode.HazardType', blank=True)),
                ('not_keywords', models.ManyToManyField(related_name='data_scope_exclude', to='base.ThesaurusKeyword', blank=True)),
                ('not_regions', models.ManyToManyField(related_name='data_scope_exclude', to='base.Region', blank=True)),
                ('regions', models.ManyToManyField(related_name='data_scope', to='base.Region', blank=True)),
            ],
        ),
    ]
