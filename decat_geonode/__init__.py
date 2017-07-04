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

from django.db.models import signals

class DecatAppConfig(AppConfig):
    name = 'decat_geonode'
    
    def ready(self):
        signals.post_migrate.connect(self._populate, sender=self)

    def _populate(self, *args, **kwargs):
        from decat_geonode.models import populate, populate_roles
        populate()
        populate_roles()


default_app_config = 'decat_geonode.DecatAppConfig'
