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

from django.contrib import admin

from decat_geonode.wps.models import (WebProcessingServiceRun,
                                      WebProcessingServiceExecution,)


@admin.register(WebProcessingServiceRun)
class WebProcessingServiceRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'identifier', 'title', 'service_instance',)

    list_filter = ('identifier', 'title',)
    list_select_related = True
    search_fields = ('identifier', 'title', 'service_instance',)
    readonly_fields = ('output_hook',)


@admin.register(WebProcessingServiceExecution)
class WebProcessingServiceExecutionAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'updated_at', 'process', 'status',
                    'percent_completed', 'completed', 'successful', 'failed')

    list_filter = ('created_at', 'updated_at',)
    list_select_related = True
    search_fields = ('created_at', 'updated_at', 'process')
    filter_horizontal = ('errors',)
