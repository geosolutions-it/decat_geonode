#!/bin/bash

source ~/.venvs/geonode/bin/activate

pushd $(dirname $0)

DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python manage.py $@
