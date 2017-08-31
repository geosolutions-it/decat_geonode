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
from django.apps import AppConfig

import django

class DecatWpsAppConfig(AppConfig):
    name = 'decat_geonode.wps'

    def ready(self):
        django.db.models.signals.post_migrate.connect(self._populate, sender=self)

    def _populate(self, *args, **kwargs):
        from .plugins import populate
        populate()


default_app_config = 'decat_geonode.wps.DecatWpsAppConfig'
