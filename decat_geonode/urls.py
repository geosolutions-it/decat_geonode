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

from django.conf.urls import url, include

from geonode.urls import urlpatterns
from decat_geonode.views import router, index_view


decat_urls = [
        url(r'^$', index_view, name='index'),

]

urlpatterns += (
            url(r'decat/api/', include(router.urls, namespace='decat-api')),
            url(r'decat/', include(decat_urls, namespace='decat')),
                )
