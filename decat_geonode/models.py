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
from datetime import datetime

from django.core.urlresolvers import reverse
from django.conf import settings
from django.db import models
from django.db.models.signals import pre_save, post_save, m2m_changed, pre_delete
from django.contrib.auth.models import Group
from django.contrib.gis.db import models as gismodels
from django.contrib.gis.gdal import OGRGeometry
from simple_history.models import HistoricalRecords
from cuser.middleware import CuserMiddleware
from django.utils.translation import ugettext_lazy as _

from geonode.base.models import Region, TopicCategory, ThesaurusKeyword
from geonode.people.models import Profile
from geonode.groups.models import GroupProfile
from geonode.maps.models import Map
from geonode.security.models import remove_object_permissions, set_owner_permissions

from django.dispatch import receiver
from decat_geonode.wps.signals import wps_run_complete
from decat_geonode.wps.models import WebProcessingServiceRun

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
    type = models.ForeignKey(AlertSourceType, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=False)
    uri = models.TextField(null=True)

    def __str__(self):
        return 'Alert Source: {}[{}]'.format(self.name, self.type.name)


class ImpactAssessment(SpatialAnnotationsBase):
    hazard = models.ForeignKey('HazardAlert', on_delete=models.CASCADE, related_name='assessments')
    promoted = models.BooleanField(null=False, default=False)
    promoted_at = models.DateTimeField(null=True, blank=True)
    map = models.ForeignKey(Map, null=True, blank=True, on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        super(ImpactAssessment, self).__init__(*args, **kwargs)
        self.__promoted = self.promoted

    def pre_save(self):
        if not self.hazard:
            raise ValueError("No hazard alert assigned")
        if not self.hazard.promoted:
            raise ValueError("Cannot use not promoted hazard alert instance: {}.".format(self.hazard))
        if self.__promoted and not self.promoted:
            raise ValueError("Cannot change promoted from {} to {}".format(self.__promoted, self.promoted))

        if self.promoted and not self.promoted_at:
            self.promoted_at = datetime.now()


    def post_save(self):
        if self.promoted_at:
            # let's record last cop promoted
            # to hazard, so we can sort that
            h = self.hazard
            if h.last_cop_at is None:
                h.last_cop_at = self.promoted_at
                h.save()
            else:
                last_cop_at = h.last_cop_at
                promoted_at = self.promoted_at
                if last_cop_at.tzinfo:
                    self.refresh_from_db()
                    promoted_at = self.promoted_at

                if last_cop_at < promoted_at:
                    h.last_cop_at = promoted_at
                    h.save()

    def get_map_url(self):
        return reverse('map_json', args=(self.map_id,))

    def dump(self):
        return {'role': self.role, 'map_id': self.map_id}

    def __unicode__(self):
        return 'Impact Assessment: {} - created at[{}]'.format(self.title, self.created_at)


class HazardAlert(SpatialAnnotationsBase):
    hazard_type = models.ForeignKey(HazardType, on_delete=models.CASCADE)
    level = models.ForeignKey(AlertLevel)
    source = models.ForeignKey(AlertSource)
    reported_at = models.DateTimeField(null=False, blank=False,
                                       auto_now_add=True)
    regions = models.ManyToManyField(Region)
    promoted = models.BooleanField(null=False, default=False)
    promoted_at = models.DateTimeField(null=True, blank=True)
    archived = models.BooleanField(null=False, default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    last_cop_at = models.DateTimeField(null=True, blank=None)

    history = HistoricalRecords()

    def __init__(self, *args, **kwargs):
        super(HazardAlert, self).__init__(*args, **kwargs)
        self.__promoted = self.promoted
        self.__archived = self.archived

    def pre_save(self):
        if self.__promoted and not self.promoted:
            raise ValueError("Cannot change promoted from {} to {}".format(self.__promoted, self.promoted))
        if self.__archived and not self.archived:
            raise ValueError("Cannot change archived from {} to {}".format(self.__archived, self.archived))
        if self.promoted and not self.promoted_at:
            self.promoted_at = datetime.now()
        if self.archived and not self.archived_at:
            self.archived_at = datetime.now()

    def post_save(self):
        pass

    def __unicode__(self):
        return 'Hazard / Alert: {} - [{}]'.format(self.id, self.title)


class HazardModelIO(models.Model):
    TYPE_LITERAL = 'literal'
    TYPE_NUMBER = 'number'
    TYPE_BOOLEAN = 'boolean'
    TYPE_DATE = 'date'
    TYPE_TIME = 'time'
    TYPE_DATETIME = 'datetime'
    TYPE_GN_LAYER = 'gn_layer'
    TYPE_GN_DOCUMENT = 'gn_document'
    TYPES = ((TYPE_LITERAL, 'Literal'),
             (TYPE_NUMBER, 'Number'),
             (TYPE_BOOLEAN, 'Boolean'),
             (TYPE_DATE, 'Date'),
             (TYPE_TIME, 'Time'),
             (TYPE_DATETIME, 'DateTime'),
             (TYPE_GN_LAYER, 'GeoNode Layer'),
             (TYPE_GN_DOCUMENT, 'GeoNode Document'),)

    identifier = models.CharField(max_length=255)
    label = models.TextField(default='')
    description = models.TextField(default='')
    myme_type = models.CharField(max_length=255, default='text/plain')
    type = models.CharField(max_length=20,
                            choices=TYPES,
                            default=TYPE_LITERAL)
    min_occurrencies = models.PositiveIntegerField()
    max_occurrencies = models.PositiveIntegerField()
    uploaded = models.BooleanField(null=False, default=False)
    data = models.TextField(null=True, blank=True)
    meta = models.TextField(null=True, blank=True)

    def __str__(self):
        return '{}: {}'.format(self.__class__.__name__, self.identifier)


class HazardModelDescriptor(SpatialAnnotationsBase):
    name = models.CharField(max_length=255, null=False)

    class Meta:
        abstract = True

    def __unicode__(self):
        return '{}: {}'.format(self.__class__.__name__, self.name)


class HazardModel(HazardModelDescriptor):
    uri = models.TextField(null=True, blank=True)
    runnable = models.BooleanField(null=False, default=False)
    hazard_type = models.ForeignKey(HazardType, on_delete=models.CASCADE)
    regions = models.ManyToManyField(Region, blank=True)
    inputs = models.ManyToManyField(HazardModelIO, related_name="model_inputs", blank=True)
    outputs = models.ManyToManyField(HazardModelIO, related_name="model_outputs", blank=True)

    request_template = models.FileField(null=True, blank=True)

    output_hook = models.CharField(_('output hook'), max_length=200, null=True, blank=True)

    def __init__(self, *args, **kwargs):
        super(HazardModel, self).__init__(*args, **kwargs)


class HazardModelRun(HazardModelDescriptor):
    hazard_model = models.ForeignKey(HazardModel, on_delete=models.CASCADE)
    inputs = models.ManyToManyField(HazardModelIO, related_name="run_inputs", blank=True)
    outputs = models.ManyToManyField(HazardModelIO, related_name="run_outputs", blank=True)
    hazard = models.ForeignKey(HazardAlert, null=True, blank=True, on_delete=models.CASCADE)
    impact_assessment = models.ForeignKey(ImpactAssessment, null=True, blank=True, on_delete=models.CASCADE)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='created_by', blank=True, null=True)
    last_editor = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='last_edited_by', blank=True, null=True)

    wps = models.ForeignKey(WebProcessingServiceRun, blank=True, null=True, on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        super(HazardModelRun, self).__init__(*args, **kwargs)
        self._inputs = None
        self._outputs = None

    def run_process(self):
        if not self.wps:
            self.wps = WebProcessingServiceRun.create_from_process(self.hazard_model.uri,
                                                                   self.hazard_model.name,
                                                                   self.hazard_model.request_template.path,
                                                                   output_hook=self.hazard_model.output_hook)
            # parse inputs
            inputs = []
            if self.inputs:
                for _i in self.inputs.all():
                    inputs.append((_i.label, _i.data))

            # execute process
            WebProcessingServiceRun.execute(self.wps, inputs)
        else:
            self.wps.initialize()
        self.save()

    @receiver(wps_run_complete, sender=WebProcessingServiceRun)
    def wps_run_complete_callback(sender, **kwargs):
        log.debug("Request {} finished!".format(kwargs['wps_run'].id))
        _runs = HazardModelRun.objects.filter(wps__id=kwargs['wps_run'].id)

        if _runs:
            for _r in _runs:
                _wps = WebProcessingServiceRun.objects.get(id=kwargs['wps_run'].id)
                if _wps.execution.processOutputs and _wps.execution.processOutputs.count() > 0:
                    for _out in _wps.execution.processOutputs.all():
                        try:
                            _r_outs = _r.outputs.filter(label=_out.identifier)
                            for _r_out in _r_outs:
                                if _out.data:
                                    _r_out.data = _out.data
                                    _r_out.uploaded = True
                                else:
                                    _r_out.data = ""
                                    _r_out.uploaded = False
                                _r_out.save()
                        except:
                            log.exception("Could not save Process Output"
                                          " {} for HazardModelRun {}".format(_out.identifier, _r.id))

    def pre_save(self):
        assert self.hazard_model
        if not self.id:
            self.creator = Profile.objects.get(username=CuserMiddleware.get_user())
            self._inputs = []
            self._outputs = []

            if self.hazard_model.inputs.all():
                for _i in self.hazard_model.inputs.all():
                    _i.id = None
                    self._inputs.append(_i)

            if self.hazard_model.outputs:
                for _o in self.hazard_model.outputs.all():
                    _o.id = None
                    self._outputs.append(_o)
        else:
            self._inputs = None
            self._outputs = None

        self.last_editor = Profile.objects.get(username=CuserMiddleware.get_user())

    def post_save(self):
        if self._inputs:
            m2m_changed.connect(self.m2m_handler, sender=self.inputs.through, weak=False)

        if self._outputs:
            m2m_changed.connect(self.m2m_handler, sender=self.outputs.through, weak=False)

    def m2m_handler(self, action, *args, **kwargs):
        if action == 'post_clear':
            if self._inputs:
                for _i in self._inputs:
                    _i.identifier = '{}[{}]-{}-input'.format(_i.identifier, self.created_at.isoformat(), _i.type)
                    _i.save()
                    self.inputs.add(_i)

            if self._outputs:
                for _o in self._outputs:
                    _o.identifier = '{}[{}]-{}-output'.format(_o.identifier, self.created_at.isoformat(), _o.type)
                    _o.save()
                    self.outputs.add(_o)

    def pre_delete(self):
        if self.inputs:
            self.inputs.all().delete()

        if self.outputs:
            self.outputs.all().delete()


class AnnotationMapGlobal(SpatialAnnotationsBase):
    hazard = models.ForeignKey('HazardAlert', on_delete=models.CASCADE, related_name='annotations')

    class Meta:
        abstract = True

    def __unicode__(self):
        return '{}: {}'.format(self.__class__.__name__, self.title)


# signals management
def hazard_object_pre_save(instance, *args, **kwargs):
    instance.pre_save()


def hazard_object_post_save(instance, *args, **kwargs):
    instance.post_save()


def hazard_object_pre_delete(instance, *args, **kwargs):
    instance.pre_delete()


pre_save.connect(hazard_object_pre_save, sender=HazardModelRun)
post_save.connect(hazard_object_post_save, sender=HazardModelRun)

pre_save.connect(hazard_object_pre_save, sender=ImpactAssessment)
post_save.connect(hazard_object_post_save, sender=ImpactAssessment)

pre_save.connect(hazard_object_pre_save, sender=HazardAlert)
post_save.connect(hazard_object_post_save, sender=HazardAlert)

pre_delete.connect(hazard_object_pre_delete, sender=HazardModelRun)


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
                q = q | models.Q(**{filter_kw: values})
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
        from geonode.api.resourcebase_api import LayerResource

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
        if user.is_authenticated() and not user.is_superuser:
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
    def has_role(cls, user):
        if not user.position:
            return
        return cls.has_group(user)

    @classmethod
    def has_group(cls, user):
        return user.groupmember_set.all().exclude(group__slug__in=cls.ROLES).exists()

    @classmethod
    def is_group_manager(cls, user):
        return user.groupmember_set.all().exclude(group__slug__in=cls.ROLES).filter(role='manager').exists()

    @classmethod
    def patch_profile(cls):
        from geonode.people.models import Profile
        from geonode.people.forms import ProfileForm
        field = Profile._meta.get_field_by_name('position')[0]
        field.choices.extend(cls.ROLES_CHOICES)
        ProfileForm.base_fields.pop('position', None)

    @classmethod
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
        g = cls.get_group(cls.ROLE_EVENT_OPERATOR)
        return cls._is_in_group(user, g)

    @classmethod
    def is_expert_assessor(cls, user):
        g = cls.get_group(cls.ROLE_EXPERT_ASSESSOR)
        return cls._is_in_group(user, g)

    @classmethod
    def is_emergency_manager(cls, user):
        g = cls.get_group(cls.ROLE_EMERGENCY_MANAGER)
        return cls._is_in_group(user, g)

    @classmethod
    def populate(cls):
        for r in cls.ROLES:
            Group.objects.get_or_create(name=r)


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


class RoleMapConfig(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='decat_maps')
    role = models.CharField(choices=Roles.ROLES_CHOICES, max_length=64, null=False, blank=False)
    map = models.ForeignKey(Map)

    def adjust_map_permissions(self):
        self.check_map_permissions()
        map = self.map

        # ensure basic flags are set properly
        map.is_published = False
        map.featured = False
        map.group = None
        remove_object_permissions(map)
        set_owner_permissions(map)
        map.save()

    def check_map_permissions(self):
        map = self.map
        user = self.user
        if map.owner != user:
            raise ValueError("Map owner must be {}".format(user))

    def get_map_url(self):
        return reverse('map_json', args=(self.map_id,))

    def dump(self):
        return {'role': self.role, 'map_id': self.map_id}


def adjust_map_permissions_pre(sender, instance, *args, **kwargs):
    instance.check_map_permissions()


def adjust_map_permissions(sender, instance, *args, **kwargs):
    instance.adjust_map_permissions()


pre_save.connect(adjust_map_permissions_pre, sender=RoleMapConfig)
post_save.connect(adjust_map_permissions, sender=RoleMapConfig)


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
