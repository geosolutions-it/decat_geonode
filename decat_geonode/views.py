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

from datetime import datetime, timedelta
import json

from django.core.urlresolvers import reverse
from django.views.generic import TemplateView, FormView
from django.shortcuts import redirect
from django.contrib.gis.gdal import OGRGeometry
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.db import models
from django import forms
from django.http import HttpResponseForbidden
from django.conf import settings

from rest_framework import serializers, views, generics
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.exceptions import NotAuthenticated, ValidationError, ParseError
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework_gis.pagination import GeoJsonPagination
from rest_framework_gis.filters import InBBoxFilter


from django_filters import rest_framework as filters
from oauth2_provider.models import (AccessToken,
                                    get_application_model,
                                    generate_client_id)

from geonode.base.models import Region, TopicCategory, ThesaurusKeyword
from geonode.people.models import Profile
from geonode.groups.models import Group, GroupProfile
from geonode.maps.models import Map
from oauth2_provider.models import (AccessToken,
                                    get_application_model,
                                    generate_client_id)

from decat_geonode.models import (HazardAlert, HazardType,
                                  AlertSource, AlertSourceType,
                                  AlertLevel, Region, GroupDataScope,
                                  RoleMapConfig, Roles,)
from decat_geonode.forms import GroupMemberRoleForm

REGIONS_Q = Region.objects.exclude(models.Q(children__isnull=False)|models.Q(parent__isnull=True)).order_by('name')


class HazardTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HazardType
        fields = ('name', 'description', 'icon',)


class AlertSourceTypeSerializer(serializers.ModelSerializer):

    class Meta:
        model = AlertSourceType
        fields = ('name', 'description', 'icon',)


class _AlertSourceSerializer(serializers.ModelSerializer):

    type = serializers.SlugRelatedField(read_only=True,
                                        many=False,
                                        slug_field='name')

    class Meta:
        model = AlertSource
        fields = ('type', 'name', 'uri',)


class MapConfigSerializer(serializers.ModelSerializer):
    map_url = serializers.SerializerMethodField()
    map = serializers.SlugRelatedField(read_only=False, 
                                          queryset=Map.objects.all(), 
                                          many=False, 
                                          slug_field="id")

    class Meta:
        model = RoleMapConfig
        fields = ('role', 'map', 'map_url',)

    def get_map_url(self, obj):
        return obj.get_map_url()

class UserDataSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()
    groups = serializers.SerializerMethodField()
    maps = MapConfigSerializer(many=True, read_only=False, source='decat_maps')
    data_scope = serializers.SerializerMethodField()

    def get_data_scope(self, obj):
        out = []
        s = GroupDataScopeSerializer
        for g in GroupDataScope.get_for(obj):
            out.append(s(g).data)
        return out
            
    def get_groups(self, obj):
        groups = list(obj.group_list_all().values_list('slug', flat=True))
        return groups

    def get_roles(self, obj):
        if obj.is_superuser:
            roles = Roles.ROLES[1:]
        else:
            roles = [obj.position] if obj.position else []
        #roles = obj.groups.all().values_list('name', flat=True)
        return roles

    class Meta:
        model = Profile
        fields = ('username', 'roles', 'groups', 'maps', 'data_scope',)
        read_only_fields = ('username', 'data_scope',)


    def update(self, instance, validated_data):
        _maps = validated_data.pop('decat_maps', None) or []
        instance.decat_maps.all().delete()
        for m in _maps:
            minst = m['map']
            conf = RoleMapConfig.objects.create(user=instance, role=m['role'], map=minst)
            instance.decat_maps.add(conf)
        instance.save()
        return instance


class AlertSourceSerializer(serializers.Serializer):
    type = serializers.SlugRelatedField(read_only=False,
                                        many=False,
                                        queryset=AlertSourceType.objects.all(),
                                        slug_field='name')
    name = serializers.CharField(max_length=255, required=True)
    uri = serializers.CharField(required=False, allow_null=True)


class AlertLevelSerializer(serializers.ModelSerializer):

    class Meta:
        model = AlertLevel
        fields = ('name', 'description', 'icon',)


class RegionSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=16)
    name = serializers.CharField(required=False)
    srid = serializers.CharField(required=False)
    bbox = serializers.SerializerMethodField()

    def get_bbox(self, obj):
        geom = OGRGeometry.from_bbox(obj.bbox[:4])
        return json.loads(geom.json)

class HazardAlertSerializer(GeoFeatureModelSerializer):
    hazard_type = serializers.SlugRelatedField(many=False,
                                               read_only=False,
                                               queryset=HazardType
                                               .objects.all(),
                                               slug_field='name')
    source = AlertSourceSerializer(read_only=False)
    level = serializers.SlugRelatedField(many=False,
                                         read_only=False,
                                         queryset=AlertLevel
                                         .objects.all(),
                                         slug_field='name')
    regions = RegionSerializer(many=True, read_only=False)
    url = serializers.SerializerMethodField()

    class Meta:
        model = HazardAlert
        geo_field = 'geometry'
        fields = ('title', 'created_at', 'updated_at',
                  'description', 'reported_at', 'hazard_type',
                  'source', 'level', 'regions', 'promoted', 'promoted_at', 'id', 'url',)

        read_only_fields = ('promoted_at',)

    def get_url(self, obj):
        id = obj.id
        return reverse('decat-api:hazardalert-detail', args=(id,))

    def _process_validated_data(self, validated_data):

        _source = validated_data.pop('source', None)
        _regions = validated_data.pop('regions', None)
        if _source:
            _stype = _source['type']
            if isinstance(_stype, AlertSourceType):
                source_type = _stype
            else:
                source_type = AlertSourceType.objects.get(name=_stype)
            source, _ = AlertSource.objects.get_or_create(type=source_type,
                                                          name=_source['name'])
            if _source.get('uri'):
                source.uri = _source['uri']
                source.save()
            validated_data['source'] = source

        if _regions:
            regions = []
            for _r in _regions:
                regions.append(Region.objects.get(code=_r['code']))
            validated_data['regions'] = regions
        return validated_data

    def update(self, instance, validated_data):
        validated_data = self._process_validated_data(validated_data)
        regions = validated_data.pop('regions', None)

        for vname, val in validated_data.iteritems():
            setattr(instance, vname, val)
        if isinstance(regions, list):
            instance.regions.clear()
            instance.regions.add(*regions)
        
        try:
            instance.save()
        except ValueError, err:
            raise ValidationError(err)
        
        return instance

    def create(self, validated_data):
        validated_data = self._process_validated_data(validated_data)
        regions = validated_data.pop('regions')

        ha = HazardAlert.objects.create(**validated_data)
        ha.regions.add(*regions)
        ha.save()
        return ha


class _GroupProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = GroupProfile
        fields = ('id', 'title', 'slug', 'description', 'access',)

class _TopicCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = TopicCategory
        fields = ('id', 'identifier', 'description',)


class KeywordsSerializer(serializers.ModelSerializer):
    thesaurus = serializers.SlugRelatedField(many=False,
                                             read_only=True,
                                             slug_field='slug')
    class Meta:
        model = ThesaurusKeyword
        fields = ('id', 'thesaurus', 'alt_label')

class GroupDataScopeSerializer(serializers.ModelSerializer):
    group = _GroupProfileSerializer(read_only=True)
    categories = _TopicCategorySerializer(many=True, read_only=True)
    hazard_types = serializers.SlugRelatedField(many=True,
                                           read_only=True,
                                           slug_field='name')
    alert_levels = serializers.SlugRelatedField(many=True,
                                           read_only=True,
                                           slug_field='name')
    keywords = KeywordsSerializer(many=True, read_only=True)
    regions = serializers.SlugRelatedField(many=True,
                                           read_only=True,
                                           slug_field='code')
    
    not_categories = _TopicCategorySerializer(many=True, read_only=True)
    not_hazard_types = serializers.SlugRelatedField(many=True,
                                           read_only=True,
                                           slug_field='name')
    not_alert_levels = serializers.SlugRelatedField(many=True,
                                           read_only=True,
                                           slug_field='name')
    not_keywords = KeywordsSerializer(many=True, read_only=True)
    not_regions = serializers.SlugRelatedField(many=True, 
                                               read_only=True, 
                                               slug_field='code')
    
    class Meta:
        model = GroupDataScope
        fields = ('id', 'group', 'categories', 'regions', 'hazard_types', 'alert_levels', 'keywords',
                  'not_categories', 'not_regions', 'not_hazard_types', 'not_alert_levels', 'not_keywords',)


# geojson pagination enabler
class LocalGeoJsonPagination(GeoJsonPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


class LocalPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


class RegionFilter(filters.FilterSet):
    name__startswith = filters.CharFilter(name='name',
                                          lookup_expr='istartswith')
    name__endswith = filters.CharFilter(name='name',
                                        lookup_expr='iendswith')
    

    class Meta:
        model = Region
        fields = ('code', 'name', 'name__startswith', 'name__endswith',)

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    pass

class CharInFilter(filters.BaseInFilter, filters.CharFilter):
    pass

class ManualRegionBBoxFilter(filters.Filter):

    def get_filter_bbox(self, value):
        if not value:
            return
        try:
            p1x, p1y, p2x, p2y = (float(n) for n in value.split(','))
        except ValueError, err:
            raise ParseError('Invalid bbox string supplied for parameter {}: {}'.format(value, err))
        x = (p1x, p1y, p2x, p2y,)
        return x

    def filter(self, qs, value):
        bbox = self.get_filter_bbox(value)
        fname_base = 'bbox'
        if not bbox:
            return qs
        p1x, p1y, p2x, p2y = bbox
        q = models.Q

        subq = Region.objects.extra(where=['not ST_Disjoint(ST_MakeLine(ST_Point(bbox_y0, bbox_x0), ST_Point(bbox_y1, bbox_x1))::box2d::geometry, ST_MakeLine(ST_Point(%s, %s), ST_Point(%s, %s))::box2d::geometry) ',],
                                    params=bbox).all()

        return qs.filter(regions__in=subq).distinct()


class HazardAlertFilter(filters.FilterSet):
    title__startswith = filters.CharFilter(name='title',
                                           lookup_expr='istartswith')
    title__endswith = filters.CharFilter(name='title',
                                         lookup_expr='iendswith')

    title__contains = filters.CharFilter(name='title',
                                         lookup_expr='icontains')
    regions__code__in = CharInFilter(name='regions__code',
                                     lookup_expr='in')

    regions__name__in = CharInFilter(name='regions__name',
                                     lookup_expr='in')


    hazard_type__in = CharInFilter(name='hazard_type__name',
                                     lookup_expr='in')

    level__in = CharInFilter(name='level__name',
                                     lookup_expr='in')

    regions__name__startswith = filters.CharFilter(name='regions__name',
                                                   lookup_expr='istartswith')
    regions__name__endswith = filters.CharFilter(name='regions__name',
                                                 lookup_expr='iendswith')
    source__name__startswith = filters.CharFilter(name='source__name',
                                                  lookup_expr='istartswith')
    source__name__endswith = filters.CharFilter(name='source__name',
                                                lookup_expr='iendswith')

    reported_at__gt = filters.IsoDateTimeFilter(name='reported_at',
                                                lookup_expr='gte')

    reported_at__lt = filters.IsoDateTimeFilter(name='reported_at',
                                                lookup_expr='lte')

    updated_at__gt = filters.IsoDateTimeFilter(name='updated_at',
                                                lookup_expr='gte')

    updated_at__lt = filters.IsoDateTimeFilter(name='updated_at',
                                                lookup_expr='lte')

    promoted_at__gt = filters.IsoDateTimeFilter(name='promoted_at',
                                                lookup_expr='gte')

    promoted_at__lt = filters.IsoDateTimeFilter(name='promoted_at',
                                                lookup_expr='lte')
    in_bbox = ManualRegionBBoxFilter()

    reported_at__gt.field_class.input_formats +=\
        settings.DATETIME_INPUT_FORMATS
    reported_at__lt.field_class.input_formats +=\
        settings.DATETIME_INPUT_FORMATS
    updated_at__gt.field_class.input_formats +=\
        settings.DATETIME_INPUT_FORMATS
    updated_at__lt.field_class.input_formats +=\
        settings.DATETIME_INPUT_FORMATS



    class Meta:

        model = HazardAlert
        fields = ('promoted', 'title', 'title__startswith',
                  'title__endswith', 'regions__code',
                  'regions__name', 'regions__name__startswith',
                  'regions__name__endswith', 'regions__name__in',
                  'regions__code__in', 'source__type__name',
                  'source__name', 'source__name__startswith',
                  'source__name__endswith', 'hazard_type__name',
                  'level__name', 'reported_at__gt', 'reported_at__lt',
                  'updated_at__gt', 'updated_at__lt', 'hazard_type__in',
                  'level__in', 'title__contains', 'promoted_at__gt',
                  'promoted_at__lt', 'in_bbox')


# views
class HazardAlertViewset(ModelViewSet):
    serializer_class = HazardAlertSerializer
    filter_class = HazardAlertFilter
    pagination_class = LocalGeoJsonPagination
    queryset = HazardAlert.objects.all().order_by('-updated_at')

    def get_queryset(self):
        queryset = super(HazardAlertViewset, self).get_queryset()
        u = self.request.user
        filtered_queryset = GroupDataScope.filter_for_user(u, queryset, 'alert')
        return filtered_queryset


class HazardTypesList(ReadOnlyModelViewSet):
    serializer_class = HazardTypeSerializer
    queryset = HazardType.objects.all()


class AlertLevelsList(ReadOnlyModelViewSet):
    serializer_class = AlertLevelSerializer
    queryset = AlertLevel.objects.all()


class AlertSourceTypeList(ReadOnlyModelViewSet):
    serializer_class = AlertSourceTypeSerializer
    queryset = AlertSourceType.objects.all()


class RegionList(ReadOnlyModelViewSet):
    serializer_class = RegionSerializer
    # with current dataset, countries are the last leaf in region tree
    # we should filter out roots and all elements between root and last leaf
    queryset = REGIONS_Q
    pagination_class = LocalPagination
    filter_class = RegionFilter

    def get_queryset(self):
        q = self.queryset
        px = py = None
        qs = self.request.GET
        try:
            px, py = (qs.get('point') or '').split(',')
        except (ValueError, IndexError,):
            pass
        try:
            if not (px is None or py is None):
                px, py = float(px), float(py)
        except (ValueError, TypeError,), err:
            raise ValueError("Invalid point data; {}".format(qs.get('point')))
        if not (px is None or py is None):
            q = self.queryset.filter(bbox_x0__lte=px,
                         bbox_x1__gte=px,
                         bbox_y0__lte=py,
                         bbox_y1__gte=py)
        return q


class GroupDataScopeAPIView(generics.ListAPIView):
    serializer_class = GroupDataScopeSerializer
    queryset = GroupDataScope.objects.all()
    pagination_class = LocalPagination


router = DefaultRouter()
router.register('alerts', HazardAlertViewset)
router.register('hazard_types', HazardTypesList)
router.register('alert_levels', AlertLevelsList)
router.register('alert_sources/types', AlertSourceTypeList)
router.register('regions', RegionList)



# regular views
class UserDetailsView(generics.UpdateAPIView):
    serializer_class = UserDataSerializer

    def get_object(self):
        user = self.request.user
        if user.is_authenticated():
            return user
        raise NotAuthenticated()

    def get_queryset(self):
        u = self.request.user
        return get_user_model().objects.filter(username=u.username)

    def get_token_for_user(self, user):
        Application = get_application_model()
        default_application = Application.objects.get(name='GeoServer')
        at = None
        atokens = AccessToken.objects.filter(user=user,
                                             application=default_application)
        for atoken in atokens:
            if not atoken.is_valid():
                continue
            at = atoken
        if at is None:
            expires = datetime.now()+timedelta(days=1)
            at = AccessToken.objects.create(user=user,
                                            scope="read",
                                            token=generate_client_id(),
                                            application=default_application,
                                            expires=expires)
        return at

    def get(self, request):
        resp = {'status': 'error', 'errors': {}, 'success': False}
        if not request.user.is_authenticated():
            resp['errors']['user'] = 'User is not authenticated'
            return Response(resp, status=401)

        user = request.user
        user.refresh_from_db()

        token = self.get_token_for_user(user)

        user = UserDataSerializer(instance=user)
        data = user.data
        data['token'] = {'token': token.token,
                         'expires': token.expires}
        resp['status'] = 'ok'
        resp['success'] = True
        resp['data'] = data
        return Response(resp)


class IndexView(TemplateView):
    template_name = 'decat/index.html'
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponseForbidden()
        if not Roles.has_role(request.user):
            return HttpResponseForbidden()
        return super(IndexView, self).dispatch(request, *args, **kwargs)


class GroupMemberRoleView(FormView):
    form_class = GroupMemberRoleForm

    def get_instance(self):
        u = self.kwargs['user']
        return Profile.objects.get(username=u)

    def get_group(self):
        gid = self.kwargs['group_id']
        return GroupProfile.objects.get(slug=gid)

    def get_form_kwargs(self):
        kwargs = super(GroupMemberRoleView, self).get_form_kwargs()
        kwargs['instance'] = self.get_instance()

        return kwargs

    def get_success_url(self):
        gid = self.kwargs['group_id']
        return reverse('group_members', args=(gid,))

    def form_invalid(self, form):
        msg = "Cannot set role to user: {}".format(', '.join('{}={}'.format(k,v) for k,v in form.errors.items()))
        messages.error(self.request, msg)
        return redirect(self.get_success_url())

    def form_valid(self, form):
        current_user = self.request.user
        group = self.get_group()
        if not current_user.is_authenticated:
            messages.error(self.request, 'you cannot set position')
            return redirect(self.get_success_url())
        if not (current_user.is_superuser or group.user_is_role(current_user, 'manager')):
            messages.error(self.request, 'you cannot set position')
            return redirect(self.get_success_url())

        d = form.cleaned_data
        inst = form.instance
        inst.position = d['position']
        inst.save()
        return redirect(self.get_success_url())

class GroupDataScopeForm(forms.ModelForm):
    
    class Meta:
        model = GroupDataScope
        fields = ('categories', 'regions', 'hazard_types', 'alert_levels',
                  'keywords', 'not_categories', 'not_regions', 
                  'not_hazard_types', 'not_alert_levels', 'not_keywords',)

    def __init__(self, *args, **kwargs):
        super(GroupDataScopeForm, self).__init__(*args, **kwargs)
        self.fields['regions'].queryset = REGIONS_Q
        self.fields['not_regions'].queryset = REGIONS_Q


class GroupDataScopeView(FormView):

    form_class = GroupDataScopeForm
    template_name = 'decat/groupdatascope_edit.html'

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated():
            return HttpResponseForbidden()
        if not (request.user.is_superuser or
                Roles.is_group_manager(request.user)):
            return HttpResponseForbidden()
        return super(GroupDataScopeView, self).dispatch(request, *args, **kwargs)

    def get_object(self):
        grp = self.get_group()
        try:
            return grp.data_scope
        # should be RelatedObjectDoesNotExist, but that's hacked class
        except Exception:
            pass

    def get_success_url(self):
        gid = self.kwargs['group_id']
        return reverse('decat:data_scope', args=(gid,))

    def get_form_kwargs(self):
        kwargs = super(GroupDataScopeView, self).get_form_kwargs()
        instance = self.get_object()
        if instance:
            kwargs['instance'] = instance
        return kwargs

    def get_group(self):
        gid = self.kwargs['group_id']
        return GroupProfile.objects.get(id=gid)

    def get_context_data(self, *args, **kwargs):
        ctx = super(GroupDataScopeView, self).get_context_data(*args, **kwargs)
        ctx['object'] = self.get_object()
        ctx['group'] = self.get_group()
        return ctx

    def form_valid(self, form):
        form.instance.group = self.get_group()
        instance = form.save()
        return super(GroupDataScopeView, self).form_valid(form)


index_view = IndexView.as_view()
user_view = UserDetailsView.as_view()
data_scope_view = GroupDataScopeView.as_view()
group_member_role_view = GroupMemberRoleView.as_view()
data_scope_api_view = GroupDataScopeAPIView.as_view()
