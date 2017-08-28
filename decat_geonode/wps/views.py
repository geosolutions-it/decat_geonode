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

from rest_framework import serializers, views, generics
from rest_framework.routers import DefaultRouter
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.pagination import PageNumberPagination

from .models import (WebProcessingServiceRun, WebProcessingServiceExecution,
                     WebProcessingServiceExecutionError, WebProcessingServiceExecutionOutput)

log = logging.getLogger(__name__)


class LocalPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500


class WebProcessingServiceExecutionErrorSerializer(serializers.ModelSerializer):

    class Meta:
        model = WebProcessingServiceExecutionError
        fields = '__all__'


class WebProcessingServiceExecutionOutputSerializer(serializers.ModelSerializer):

    class Meta:
        model = WebProcessingServiceExecutionOutput
        fields = '__all__'


class WebProcessingServiceExecutionSerializer(serializers.ModelSerializer):

    errors = WebProcessingServiceExecutionErrorSerializer(many=True)
    
    processOutputs = WebProcessingServiceExecutionOutputSerializer(many=True)

    class Meta:
        model = WebProcessingServiceExecution
        fields = '__all__'


class WebProcessingServiceRunSerializer(serializers.ModelSerializer):

    execution = WebProcessingServiceExecutionSerializer()

    class Meta:
        model = WebProcessingServiceRun
        fields = '__all__'


class WebProcessingServiceRunViewset(ReadOnlyModelViewSet):
    serializer_class = WebProcessingServiceRunSerializer
    queryset = WebProcessingServiceRun.objects.all()
    pagination_class = LocalPagination


router = DefaultRouter()

# ViewSets
router.register('wps_runs', WebProcessingServiceRunViewset)

# Read-only Lists

# Regular Views
