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

from django import forms
from django.forms.widgets import Select
from django.utils.translation import ugettext_lazy as _

from modeltranslation.admin import TranslationAdmin

from decat_geonode.models import (HazardType,
                                  AlertLevel,
                                  AlertSourceType,
                                  AlertSource,
                                  ImpactAssessment,
                                  HazardAlert,
                                  GroupDataScope,
                                  HazardModelIO, HazardModel, HazardModelRun)

from decat_geonode.wps.plugins import (WebProcessingServiceExecutionOutputHook,)


class OutputHookSelectWidget(Select):
    _choices = None

    def hooks_as_choices(self):
        hooks = list(sorted(o.name for o in
                            WebProcessingServiceExecutionOutputHook.objects.all().select_subclasses()))
        return (('', ''), ) + tuple(zip(hooks, hooks))

    @property
    def choices(self):
        if self._choices is None:
            self._choices = self.hooks_as_choices()
        return self._choices

    @choices.setter
    def choices(self, _):
        # ChoiceField.__init__ sets ``self.choices = choices``
        # which would override ours.
        pass


class OutputHookChoiceField(forms.ChoiceField):
    widget = OutputHookSelectWidget

    def valid_value(self, value):
        return True


class ExecutionOutputHookForm(forms.ModelForm):
    output_hook = OutputHookChoiceField(label=_('Output Hook (registered)'),
                                        required=False)

    class Meta:
        model = HazardModel
        exclude = ()

    def _clean_json(self, field):
        value = self.cleaned_data[field]
        try:
            loads(value)
        except ValueError as exc:
            raise forms.ValidationError(
                _('Unable to parse JSON: %s') % exc,
            )
        return value

    def clean_args(self):
        return self._clean_json('args')

    def clean_kwargs(self):
        return self._clean_json('kwargs')


@admin.register(HazardType, AlertLevel, AlertSourceType)
class IconEnumTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon',)


@admin.register(AlertSource)
class AlertSourceAdmin(admin.ModelAdmin):
    list_display = ('type', 'name', 'uri',)


@admin.register(ImpactAssessment)
class ImpactAssessmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'title', 'hazard', 'promoted', 'promoted_at',)

    list_filter = ('hazard',)
    list_select_related = True
    search_fields = ('created_at', 'title', 'hazard', 'promoted')


@admin.register(HazardAlert)
class HazardAlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'title', 'hazard_type', 'promoted', 'archived',)

    list_filter = ('hazard_type', 'level', 'source__type', 'promoted', 'regions', 'archived',)
    list_select_related = True
    search_fields = ('name', 'description',)


@admin.register(GroupDataScope)
class GroupDataScopeAdmin(admin.ModelAdmin):
    list_display = ('id', 'group',)


@admin.register(HazardModelIO)
class HazardModelIOAdmin(admin.ModelAdmin):
    list_display = ('id', 'identifier', 'label', 'type',)


@admin.register(HazardModel)
class HazardModelAdmin(admin.ModelAdmin):
    form = ExecutionOutputHookForm
    list_display = ('id', 'name', 'hazard_type', 'runnable',)
    filter_horizontal = ('regions', 'inputs', 'outputs',)


@admin.register(HazardModelRun)
class HazardModelRunAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'hazard_model',)
    filter_horizontal = ('inputs', 'outputs',)
