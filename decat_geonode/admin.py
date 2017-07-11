# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2016 OSGeo
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

from modeltranslation.admin import TranslationAdmin

from decat_geonode.models import (HazardType, 
                                  AlertLevel, 
                                  AlertSourceType, 
                                  AlertSource, 
                                  HazardAlert,
                                  GroupDataScope,)


@admin.register(HazardType, AlertLevel, AlertSourceType)
class IconEnumTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon',)


@admin.register(AlertSource)
class AlertSourceAdmin(admin.ModelAdmin):
    list_display = ('type', 'name', 'uri',)


@admin.register(HazardAlert)
class HazardAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'title', 'hazard_type', 'promoted',)

    list_filter = ('hazard_type', 'level', 'source__type', 'promoted', 'regions',)
    list_select_related = True
    search_fields = ('name', 'description',)


@admin.register(GroupDataScope)
class GroupDataScopeAdmin(admin.ModelAdmin):
    list_display = ('id', 'group',)
