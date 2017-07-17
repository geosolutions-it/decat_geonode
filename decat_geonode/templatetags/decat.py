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

from django import template

from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.conf import settings

from geonode.groups.models import GroupProfile
from decat_geonode.forms import GroupMemberRoleForm

register = template.Library()


@register.simple_tag(takes_context=True)
def member_role_form(context, member):
    current_user = context['request'].user
    if not current_user.is_authenticated:
        return ''
    group = member.group
    if not (current_user.is_superuser or group.user_is_role(current_user, 'manager')):
        return ''
    user = member.user
    form = GroupMemberRoleForm(instance=user)
    ctx = {'form': form,
           'user': user,
           'request': context['request'],
           'group': member.group,
           'member': member }
    return render_to_string('groups/_member_role_form.html', ctx, request=context['request'])
