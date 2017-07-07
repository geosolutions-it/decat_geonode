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

from django.core.urlresolvers import reverse
from django.views.generic import TemplateView

from rest_framework import serializers, views
from rest_framework.routers import DefaultRouter
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework_gis.pagination import GeoJsonPagination
from django_filters import rest_framework as filters

from decat_geonode.models import (HazardAlert, HazardType,
                                  AlertSource, AlertSourceType,
                                  AlertLevel, Region)
from geonode.people.models import Profile
from oauth2_provider.models import (AccessToken,
                                    get_application_model,
                                    generate_client_id)


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


class UserDataSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    def get_roles(self, obj):
        roles = obj.groups.all().values_list('name', flat=True)
        return roles

    class Meta:
        model = Profile
        fields = ('username', 'roles',)


class AlertSourceSerializer(serializers.Serializer):
    type = serializers.CharField(max_length=32, required=True)
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
                  'source', 'level', 'regions', 'promoted', 'id', 'url',)

    def get_url(self, obj):
        id = obj.id
        return reverse('decat-api:hazardalert-detail', args=(id,))

    def _process_validated_data(self, validated_data):

        _source = validated_data.pop('source', None)
        _regions = validated_data.pop('regions', None)
        if _source:

            source_type = AlertSourceType.objects.get(name=_source['type'])
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
            instance.save()
        return instance

    def create(self, validated_data):
        validated_data = self._process_validated_data(validated_data)
        regions = validated_data.pop('regions')

        ha = HazardAlert.objects.create(**validated_data)
        ha.regions.add(*regions)
        ha.save()
        return ha


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
        fields = ('name', 'name__startswith', 'name__endswith',)


class HazardAlertFilter(filters.FilterSet):
    title__startswith = filters.CharFilter(name='title',
                                           lookup_expr='istartswith')
    title__endswith = filters.CharFilter(name='title',
                                         lookup_expr='iendswith')
    regions__name__startswith = filters.CharFilter(name='regions__name',
                                                   lookup_expr='istartswith')
    regions__name__endswith = filters.CharFilter(name='regions__name',
                                                 lookup_expr='iendswith')
    source__name__startswith = filters.CharFilter(name='source__name',
                                                  lookup_expr='istartswith')
    source__name__endswith = filters.CharFilter(name='source__name',
                                                lookup_expr='iendswith')

    class Meta:
        model = HazardAlert
        fields = ('promoted', 'title', 'title__startswith',
                  'title__endswith', 'regions__code',
                  'regions__name__startswith', 'regions__name__endswith',
                  'source__type__name', 'source__name',
                  'source__name__startswith', 'source__name__endswith',
                  'hazard_type__name', 'level__name',)


# views
class HazardAlertViewset(ModelViewSet):
    serializer_class = HazardAlertSerializer
    filter_class = HazardAlertFilter
    pagination_class = LocalGeoJsonPagination
    queryset = HazardAlert.objects.all()


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
    queryset = Region.objects.all()
    pagination_class = LocalPagination
    filter_class = RegionFilter


router = DefaultRouter()
router.register('alerts', HazardAlertViewset)
router.register('hazard_types', HazardTypesList)
router.register('alert_levels', AlertLevelsList)
router.register('alert_sources/types', AlertSourceTypeList)
router.register('regions', RegionList)


# regular views
class UserDetailsView(views.APIView):

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


index_view = IndexView.as_view()
user_view = UserDetailsView.as_view()
