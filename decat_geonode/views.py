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

from decat_geonode.models import HazardAlert, HazardType, AlertSource, AlertSourceType, AlertLevel, Region

from rest_framework import serializers
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework_gis.pagination import GeoJsonPagination


from django_filters.rest_framework import DjangoFilterBackend


class HazardTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HazardType
        fields = ('name', 'description', 'icon',)


class AlertSourceTypeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AlertSourceType
        fields = ('name',)


class AlertSourceSerializer(serializers.ModelSerializer):
    type = AlertSourceTypeSerializer(read_only=True, many=False)
    
    class Meta:
        model = AlertSource
        fields = ('type', 'name', 'uri',)


class AlertLevelSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AlertLevel
        fields = ('name',)

class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Region
        fields = ('code', 'name', 'srid',)

class HazardAlertSerializer(GeoFeatureModelSerializer):
    hazard_type = HazardTypeSerializer(read_only=True)
    source = AlertSourceSerializer(read_only=True)
    level = AlertLevelSerializer(read_only=True)
    regions = RegionSerializer(many=True, read_only=True)

    class Meta:
        model = HazardAlert
        geo_field = 'geometry'
        fields = ('title', 'created_at', 'updated_at', 
                  'description', 'reported_at', 'hazard_type', 'source', 'level', 'regions',)

# geojson pagination enabler
class Pagination(GeoJsonPagination):
    page_size = 100

# views
class HazardAlertViewset(ModelViewSet):
    serializer_class = HazardAlertSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_filelds = ('promoted', 'geometry', 'regions', 'source', 'hazard_type', 'level',)
    pagination_class = Pagination
    queryset = HazardAlert.objects.all()

router = DefaultRouter()
router.register('alerts', HazardAlertViewset)



