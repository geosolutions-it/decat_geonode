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
from __future__ import print_function

import json

from django.test import TestCase
from django.contrib.auth import get_user_model

from decat_geonode.models import HazardAlert, HazardType, AlertSource, AlertSourceType, AlertLevel, Region


class HazardAlertsTestCase(TestCase):
    fixtures = ['initial_data.json', 'regions.json']

    def setUp(self):
        super(HazardAlertsTestCase, self).setUp()
        from decat_geonode.models import populate_tests as populate

        uname, upasswd = 'admin', 'admin'
        umodel = get_user_model()
        
        self.user, _ = umodel.objects.get_or_create(username=uname)
        self.user.email = 'admin@adm.i.n'
        self.user.is_active = True
        self.user.is_superuser = True
        self.user.set_password(upasswd)
        self.upassword = upasswd
        self.username = uname
        self.user.save()

        populate()

    def test_hazard_rest_api(self):
        self.client.login(username=self.username, password=self.upassword)
        url = '/decat/alerts/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)

        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'FeatureCollection')
        self.assertEqual(len(jdata['features']), 1)
        self.assertEqual(jdata['features'][0]['properties']['title'], 'test event')
        print(jdata)
        
