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

    def test_hazard_rest_api_list(self):
        self.client.login(username=self.username, password=self.upassword)
        url = '/decat/api/alerts/'
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)

        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'FeatureCollection')
        self.assertEqual(len(jdata['features']), 1)
        self.assertEqual(jdata['features'][0]['properties']['title'],
                         'test event')


    def test_hazard_rest_api_create(self):
        self.client.login(username=self.username, password=self.upassword)
        url = '/decat/api/alerts/'
        data = {'type': 'Feature',
                   'geometry': {
                        'type': 'Point',
                        'coordinates': [12.5, 40.0],

                        },
                   'properties': {'title': 'another event',
                                  'reported_at': '2016-01-01 10:00:01',
                                  'description': 'test description',
                                  "hazard_type": "wildfire",
                                  'source': {'type': 'email',
                                             'name': 'super reporter',
                                             'uri': None},
                                  'level': 'warning',
                                  'regions': [{'code': 'ITA'}]
                        }
                  }
        
        payload = json.dumps(data)

        resp = self.client.post(url, payload, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)

        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'Feature')
        self.assertEqual(jdata['properties']['title'],
                         'another event')

        test_url = '/decat/api/alerts/{}/'.format(jdata['id'])
        self.assertEqual(test_url, jdata['properties']['url'])
        data['properties']['description'] = 'test description modified'
        data['properties']['regions'] = [{'code': 'FRA'}, {'code': 'ITA'}]

        payload = json.dumps(data)
        url = jdata['properties']['url']
        resp = self.client.put(url, payload, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)
        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'Feature')
        self.assertEqual(jdata['properties']['promoted'], False)
        self.assertEqual(jdata['properties']['description'],
                         'test description modified')
        self.assertEqual([r['code'] for r in jdata['properties']['regions']], ['FRA', 'ITA'])


        payload = json.dumps({'properties': {'promoted': True}})
        url = jdata['properties']['url']
        resp = self.client.patch(url, payload, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)
        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'Feature')
        self.assertEqual(jdata['properties']['description'],
                         'test description modified')
        self.assertEqual([r['code'] for r in jdata['properties']['regions']], ['FRA', 'ITA'])

        self.assertEqual(jdata['properties']['promoted'], True)
