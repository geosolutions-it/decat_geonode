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

from geonode.settings import *

PROJECT_NAME = 'decat_geonode'

# Defines the directory that contains the settings file as the LOCAL_ROOT
# It is used for relative settings elsewhere.
LOCAL_ROOT = os.path.abspath(os.path.dirname(__file__))

WSGI_APPLICATION = "{}.wsgi.application".format(PROJECT_NAME)

# Location of url mappings
ROOT_URLCONF = os.getenv('ROOT_URLCONF', '{}.urls'.format(PROJECT_NAME))

INSTALLED_APPS += (PROJECT_NAME,)

MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(LOCAL_ROOT, "uploaded"))

STATIC_ROOT = os.getenv('STATIC_ROOT',
                        os.path.join(LOCAL_ROOT, "static_root")
                        )

# Additional directories which hold static files
STATICFILES_DIRS.append(
    os.path.join(LOCAL_ROOT, "static"),
)

# Location of locale files
LOCALE_PATHS = (
    os.path.join(LOCAL_ROOT, 'locale'),
    ) + LOCALE_PATHS

TEMPLATES[0]['DIRS'].insert(0, os.path.join(LOCAL_ROOT, "templates"))
loaders = TEMPLATES[0]['OPTIONS'].get('loaders') or ['django.template.loaders.filesystem.Loader','django.template.loaders.app_directories.Loader']
loaders.insert(0, 'apptemplates.Loader')
TEMPLATES[0]['OPTIONS']['loaders'] = loaders
TEMPLATES[0].pop('APP_DIRS', None)

STATICFILES_DIRS.append(os.path.join(LOCAL_ROOT,  'staticfiles'))

INSTALLED_APPS = INSTALLED_APPS +\
    (
     'geonode.contrib.createlayer',
     'simple_history',
     'rest_framework',
     'rest_framework_gis',
     'django_filters',
     'cuser',
     'decat_geonode.wps',
    )

TEMPLATES[0]['DIRS'].insert(0, os.path.join(LOCAL_ROOT, '..', "templates"))

MIDDLEWARE_CLASSES += (
    'simple_history.middleware.HistoryRequestMiddleware',
    'cuser.middleware.CuserMiddleware',
)

REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

_DEFAULT_LANGUAGES = (
    ('en', 'English'),
)

LANGUAGES = os.getenv('LANGUAGES', _DEFAULT_LANGUAGES)

# Documents application
ALLOWED_DOCUMENT_TYPES = [
    'avi', 'doc', 'docx', 'gif', 'jpg', 'jpeg', 'ods', 'odt', 'odp', 'pdf', 'png',
    'ppt', 'pptx', 'rar', 'sld', 'tif', 'tiff', 'txt', 'xls', 'xlsx', 'xml',
    'zip', 'gz', 'qml'
]
MAX_DOCUMENT_SIZE = int(os.getenv('MAX_DOCUMENT_SIZE ', '150'))  # MB

# CELERY SETTINGS
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_RESULT_BACKEND = 'djcelery.backends.database:DatabaseBackend'
CELERYBEAT_SCHEDULER = 'djcelery.schedulers.DatabaseScheduler'
CELERY_IMPORTS = CELERY_IMPORTS + (
    'decat_geonode.wps.tasks.wps',
)

