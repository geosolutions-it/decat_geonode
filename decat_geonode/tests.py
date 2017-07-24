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
from urllib import urlencode

from django.test import TestCase
from django.core.urlresolvers import reverse
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from geonode.base.populate_test_data import create_models
from geonode.base.models import ThesaurusKeyword, Region
from geonode.maps.models import Map
from geonode.people.models import GroupProfile
from decat_geonode.models import GroupDataScope, HazardType, AlertLevel

from oauth2_provider.models import get_application_model


def create_application():
        Application = get_application_model()
        Application.objects.get_or_create(name='GeoServer')

class HazardAlertsTestCase(TestCase):
    fixtures = ['initial_data.json', 'regions.json']

    def setUp(self):
        super(HazardAlertsTestCase, self).setUp()
        from decat_geonode.models import populate_tests as populate

        create_models('map')
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

        self.username2 = self.upassword2 = 'test'
        self.u2, _ = umodel.objects.get_or_create(username=self.username2)
        self.u2.is_active = True
        self.u2.is_superuser = False
        self.u2.set_password(self.upassword2)
        self.u2.save()

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
        self.assertIsNotNone(jdata['properties']['promoted_at'])

        payload = json.dumps({'geometry': {
                                          'type': 'Point',
                                          'coordinates': [10, 10],
                                          },
                              'properties': {'description': 'booo!'}})
        
        resp = self.client.patch(url, payload, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.content)
        jdata = json.loads(resp.content)
        self.assertTrue(isinstance(jdata, dict))
        self.assertEqual(jdata['type'], 'Feature')
        self.assertEqual(jdata['properties']['description'],
                         'booo!')
        self.assertEqual(jdata['geometry']['coordinates'], [10, 10])


        payload = json.dumps({'properties': {'promoted': False}})

        resp = self.client.patch(url, payload, content_type='application/json')
        self.assertEqual(resp.status_code, 400)
        self.assertTrue(resp.content)



    def test_user_api(self):
        create_application()
        url = reverse('decat:user')
        self.client.login(username=self.username, password=self.upassword)

        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        rdata = json.loads(resp.content)
        self.assertEqual(rdata['data']['maps'], [])
        
        m = Map.objects.all().first()
        m.owner = self.user
        m.save()

        self.assertIsNotNone(m)
        payload = {'maps': [{'role': 'event-operator', 'map': m.id}]}
        pdata = json.dumps(payload)

        resp = self.client.put(url, pdata, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        rdata = json.loads(resp.content)
        self.assertEqual(len(rdata['data']['maps']), 1)
        self.assertEqual(rdata['data']['maps'][0]['map'], m.id)
        map_url = rdata['data']['maps'][0]['map_url']
        rmap = self.client.get(map_url)
        self.assertEqual(rmap.status_code, 200)
        rdata = json.loads(rmap.content)
        self.assertTrue('map' in rdata)

        self.client.login(username=self.username2, password=self.upassword2)
        resp = self.client.get(map_url)
        self.assertEqual(resp.status_code, 403)

        self.client.login(username=self.username, password=self.upassword)
        
        # clean list
        payload = {'maps': []}
        pdata = json.dumps(payload)

        resp = self.client.put(url, pdata, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        rdata = json.loads(resp.content)
        self.assertEqual(len(rdata['data']['maps']), 0)



class DataScopeTestCase(TestCase):

    fixtures = ['initial_data.json']

    def setUp(self):
        super(DataScopeTestCase, self).setUp()
        from decat_geonode.models import populate_tests as populate
        
        create_models(type='layer')

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

    def test_data_scope(self):
        regions = Region.objects.all()[:3]
        not_regions = Region.objects.all()[3:6]
        keywords = ThesaurusKeyword.objects.all()[:3]
        not_keywords = ThesaurusKeyword.objects.all()[3:6]
        
        hazard_types = HazardType.objects.all()[:2]
        not_hazard_types = HazardType.objects.all()[2:4]

        alert_types = AlertLevel.objects.all()[:2]
        not_alert_types = AlertLevel.objects.all()[2:]

        #self.assertTrue(all((regions.exists(), not_regions.exists(), 
        #                    keywords.exists(), not_keywords.exists(),)))

        ugroup = GroupProfile.objects.create(title='user_group', slug='user-group')
        data_scope = GroupDataScope.create(group=ugroup,
                                           alert_levels=alert_types, 
                                           not_alert_levels=not_alert_types,
                                           keywords=keywords,
                                           not_regions=not_regions)
                           
    def test_regions_point(self):
        p = (12.5734, 41.2925) # mid of ITA
        base_url = reverse('decat-api:region-list')
        q = {'point': ','.join('{}'.format(item) for item in p)}
        url = '{}?{}'.format(base_url, urlencode(q))
        resp = self.client.get(url)
        data = json.loads(resp.content)
        self.assertEqual(len(data['results']), 3)
        self.assertTrue('ITA' in (r['code'] for r in data['results']))
        self.assertFalse('FRA' in (r['code'] for r in data['results']))

