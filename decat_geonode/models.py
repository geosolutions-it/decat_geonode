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
from django.contrib.auth.models import Group
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.gdal import OGRGeometry
from simple_history.models import HistoricalRecords
from django.utils.translation import ugettext_lazy as _

from geonode.base.models import Region, TopicCategory, ThesaurusKeyword
from geonode.groups.models import GroupProfile


log = logging.getLogger(__name__)


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

    def __str__(self):
        return '{}: {}'.format(self.__class__.__name__, self.name)

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

    def __str__(self):
        return 'Alert Source: {}[{}]'.format(self.name, self.type.name)

class HazardAlert(SpatialAnnotationsBase):
    hazard_type = models.ForeignKey(HazardType)
    level = models.ForeignKey(AlertLevel)
    source = models.ForeignKey(AlertSource)
    reported_at = models.DateTimeField(null=False, blank=False,
                                       auto_now_add=True)
    regions = models.ManyToManyField(Region)
    promoted = models.BooleanField(null=False, default=False)

    history = HistoricalRecords()


# supporting models
class GroupDataScope(models.Model):
    group = models.OneToOneField(GroupProfile, related_name='data_scope')
    categories = models.ManyToManyField(TopicCategory, blank=True, related_name='data_scope')
    regions = models.ManyToManyField(Region, blank=True, related_name='data_scope')
    hazard_types = models.ManyToManyField(HazardType, blank=True, related_name='data_scope')
    alert_levels = models.ManyToManyField(AlertLevel, blank=True, related_name='data_scope')
    keywords = models.ManyToManyField(ThesaurusKeyword, blank=True, related_name='data_scope')

    not_categories = models.ManyToManyField(TopicCategory, blank=True, related_name='data_scope_exclude')
    not_regions = models.ManyToManyField(Region, blank=True, related_name='data_scope_exclude')
    not_hazard_types = models.ManyToManyField(HazardType, blank=True, related_name='data_scope_exclude')
    not_alert_levels = models.ManyToManyField(AlertLevel, blank=True, related_name='data_scope_exclude')
    not_keywords = models.ManyToManyField(ThesaurusKeyword, blank=True, related_name='data_scope_exclude')
    
    FILTER_LAYER_FIELDS = (('categories', None, 'category__in',),
                           ('regions', None, 'regions__in',), 
                           ('keywords', None, 'tkeywords__in',),
                           )

    FILTER_ALERT_FIELDS = (('hazard_types', None, 'hazard_type__in',),
                           ('alert_levels', None, 'level__in',),
                           ('regions', None, 'regions__in',), 
                           )
                           #('hazard_types', 'name', ', 'alert_levels', 'keywords')

    @classmethod
    def create(cls, group, **kwargs):
        inst = cls.objects.create(group=group)
        for k, v in kwargs.items():
            mgr = getattr(inst, k)
            mgr.add(*v)
        inst.save()
        return inst
    
    def build_filter_for(self, res_type):
        return self._get_data_scope_for('filter', res_type)

    def build_exclude_for(self, res_type):
        return self._get_data_scope_for('exclude', res_type)

    def _get_data_scope_for(self, filter_type, res_type):
        f = getattr(self, 'build_{}_for_{}'.format(filter_type, res_type), None)
        if f is None:
            raise ValueError("Cannot create {} for {}".format(filter_type, res_type))
        return f()

    def build_filter_for_layer(self, neg=False):
        return self._build_filter_for_fields(self.FILTER_LAYER_FIELDS, neg=neg)

    def build_filter_for_alert(self, neg=False):
        return self._build_filter_for_fields(self.FILTER_ALERT_FIELDS, neg=neg)

    def _build_filter_for_fields(self, fields_definitions, neg=False):
        q = models.Q()
        for field_name, instance_field, filter_kw in fields_definitions:
            if neg:
                field_name = 'not_{}'.format(field_name)
            values = getattr(self, field_name).all()
            if values:
                q = q | models.Q(**{filter_kw:values})
        return q

    def build_exclude_for_layer(self):
        return self.build_filter_for_layer(neg=True)
    
    def build_exclude_for_alert(self):
        return self.build_filter_for_alert(neg=True)

    @classmethod
    def get_for(cls, user):
        groups = GroupProfile.objects.filter(groupmember__user=user)
        return cls.objects.filter(group__in=groups)

    @classmethod
    def patch_geonode_api(cls):
        """
        Patch api views to get filters applied
        """
        from geonode.api.resourcebase_api import LayerResource, MapResource, DocumentResource

        def wrap(f):
            def _wrap(*args, **kwargs):
                q = f(*args, **kwargs)
                req = args[-1]
                user = req.user
                q = cls.filter_for_user(user, q, 'layer')
                return q
            return _wrap

        func = LayerResource.get_object_list
        LayerResource.get_object_list = wrap(func)

    @classmethod
    def filter_for_user(cls, user, query, filter_for):
        if user.is_authenticated():
            try:
                gds = cls.get_for(user=user)
                if gds:
                    filter_q = models.Q()
                    exclude_q = models.Q()
                    for g in gds:
                        _f = g.build_filter_for(filter_for)
                        _e = g.build_exclude_for(filter_for)
                        filter_q = filter_q & _f
                        exclude_q = exclude_q & _e
                    query = query.filter(filter_q)
                    query = query.exclude(exclude_q)
                    
            except Exception, err:
                log.error('error during adding data scope filtering: %s', err, exc_info=err)
        return query


class Roles(object):
    ROLE_EVENT_OPERATOR = 'event-operator'
    ROLE_IMPACT_ASSESSOR = 'impact-assessor'
    ROLE_EMERGENCY_MANAGER = 'emergency-manager'
    ROLES = ('', 
             ROLE_EVENT_OPERATOR,
             ROLE_IMPACT_ASSESSOR,
             ROLE_EMERGENCY_MANAGER,)
    ROLES_NAMES = (_("No role"), _("Event Operator"), _("Impact Assessor"), _("Emergency Manager"))
    ROLES_CHOICES = zip(ROLES, ROLES_NAMES)
    _cache = {}

    @classmethod
    def patch_profile(cls):
        from geonode.people.models import Profile
        from geonode.people.forms import ProfileForm
        from django.forms import widgets
        field = Profile._meta.get_field_by_name('position')[0]
        field.choices.extend(cls.ROLES_CHOICES)
        ProfileForm.base_fields.pop('position', None) #].widget = widgets.Select(choices=cls.ROLES_CHOICES)


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

