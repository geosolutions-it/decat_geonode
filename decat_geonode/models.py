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

from django.db import models
from django.contrib.auth.models import Group
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.gdal import OGRGeometry
from simple_history.models import HistoricalRecords

from geonode.base.models import Region


class SpatialAnnotationsBase(gismodels.Model):
    geometry = gismodels.GeometryField(null=False)
    title = models.CharField(max_length=255, null=False, blank=False)
    created_at = models.DateTimeField(null=False, blank=False,
                                      auto_now_add=True)
    updated_at = models.DateTimeField(null=False, blank=False, auto_now=True)
    description = models.TextField(null=False, blank=True, default='')

    class Meta:
        abstract = True


class IconEnumBase(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=255)

    class Meta:
        abstract = True


class HazardType(IconEnumBase):
    HAZARD_EARTHQUAKE = 'earthquake'
    HAZARD_TSUNAMI = 'tsunami'
    HAZARD_FLOOD = 'flood'
    HAZARD_DROUGHT = 'drought'
    HAZARD_WILDFIRE = 'wildfire'
    HAZARD_OILSPILL = 'oilspill'
    HAZARDS = (HAZARD_EARTHQUAKE,
               HAZARD_TSUNAMI,
               HAZARD_FLOOD,
               HAZARD_DROUGHT,
               HAZARD_WILDFIRE,
               HAZARD_OILSPILL,
               )


class AlertLevel(IconEnumBase):
    LEVEL_WATCH = 'watch'
    LEVEL_INFORMATION = 'information'
    LEVEL_WARNING = 'warning'
    LEVEL_ADVISORY = 'advisory'
    LEVELS = (LEVEL_WATCH,
              LEVEL_INFORMATION,
              LEVEL_WARNING,
              LEVEL_ADVISORY,
              )


class AlertSourceType(IconEnumBase):
    SOURCE_INTERNAL = 'internal'
    SOURCE_EMAIL = 'email'
    SOURCES = (SOURCE_INTERNAL,
               SOURCE_EMAIL,)

class AlertSource(models.Model):
    type = models.ForeignKey(AlertSourceType)
    name = models.CharField(max_length=255, null=False)
    uri = models.TextField(null=True)


class HazardAlert(SpatialAnnotationsBase):
    hazard_type = models.ForeignKey(HazardType)
    level = models.ForeignKey(AlertLevel)
    source = models.ForeignKey(AlertSource)
    reported_at = models.DateTimeField(null=False, blank=False,
                                       auto_now_add=True)
    regions = models.ManyToManyField(Region)
    promoted = models.BooleanField(null=False, default=False)

    history = HistoricalRecords()

class Roles(object):
    ROLE_EVENT_OPERATOR = 'event-operator'
    ROLE_EXPERT_ASSESSOR = 'expert-assessor'
    ROLE_EMERGENCY_MANAGER = 'emergency-manager'
    ROLES = (ROLE_EVENT_OPERATOR,
             ROLE_EXPERT_ASSESSOR,
             ROLE_EMERGENCY_MANAGER,)
        
    _cache = {}

    def get_group(cls, group_name):
        try:
            return cls._cache[group_name]
        except KeyError:
            g = Group.objects.get(name=group_name)
            cls._cache[group_name] = g
            return g

    @classmethod
    def _is_in_group(cls, user, group):
        return user.groups.filter(id=group.id).exists()

    @classmethod
    def is_event_operator(cls, user):
        g = self.get_group(cls.ROLE_EVENT_OPERATOR)
        return cls._is_in_group(user, g)

    @classmethod
    def is_expert_assessor(cls, user):
        g = self.get_group(cls.ROLE_EXPERT_ASSESSOR)
        return cls._is_in_group(user, g)
    
    @classmethod
    def is_emergency_manager(cls, user):
        g = self.get_group(cls.ROLE_EMERGENCY_MANAGER)
        return cls._is_in_group(user, g)

    @classmethod
    def populate(cls):
        for r in cls.ROLES:
            g = Group.objects.get_or_create(name=r)


def populate():
    for cls, items in ((AlertLevel, AlertLevel.LEVELS,),
                       (HazardType, HazardType.HAZARDS,),
                       (AlertSourceType, AlertSourceType.SOURCES,),
                       ):
        for name in items:
            obj, _ = cls.objects.get_or_create(name=name)
            if _:
                obj.description = name
                obj.icon = name
                obj.save()


def populate_roles():
    Roles.populate()


def populate_tests():
    populate()

    at_email = AlertSourceType.objects.get(name=AlertSourceType.SOURCE_EMAIL)
    at_internal = AlertSourceType.objects.get(name=AlertSourceType.SOURCE_INTERNAL)

    as_email, _ = AlertSource.objects.get_or_create(type=at_email, name='test email')
    as_internal, _ = AlertSource.objects.get_or_create(type=at_internal, name='test internal')

    ht = HazardType.objects.get(name=HazardType.HAZARD_OILSPILL)
    lvl = AlertLevel.objects.get(name=AlertLevel.LEVEL_ADVISORY)

    regions1 = Region.objects.filter(code='ITA')
    r0 = regions1[0]
    bbox = OGRGeometry.from_bbox(r0.bbox[:4])

    ha = HazardAlert.objects.create(geometry=bbox.centroid.geos,
                                    title='test event',
                                    hazard_type=ht,
                                    level=lvl,
                                    source=as_email)
    ha.regions.add(*regions1) 
    return ha
