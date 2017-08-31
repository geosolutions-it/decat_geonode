# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2017 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################

import logging

from django.db import models
from django.utils.translation import ugettext_lazy as _

from model_utils.managers import InheritanceManager

log = logging.getLogger(__name__)


class WebProcessingServiceExecutionOutputHook(models.Model):

    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True, blank=True)

    objects = InheritanceManager()

    def process_output(self, data, **kwargs):
        pass

    def get_children(self):
        rel_objs = self._meta.get_all_related_objects()
        return [getattr(self, x.get_accessor_name()) for x in rel_objs if x.model != type(self)]

    def __init__(self, *args, **kwargs):
        super(WebProcessingServiceExecutionOutputHook, self).__init__(*args, **kwargs)

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.name)


class GeoJsonWrapperHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        try:
            from anyjson import loads
            data = loads(data)
        except ValueError as exc:
            raise forms.ValidationError(
                _('Unable to parse JSON: %s') % exc,
            )
        return data


PLUGINS = ((GeoJsonWrapperHook, 'geo-json-wrapper'),)

def populate():
    for cls, name in PLUGINS:
        obj, _ = cls.objects.get_or_create(name=name)
        if _:
            obj.save()
