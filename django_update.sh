#!/bin/bash

source ~/.venvs/geonode/bin/activate

pushd $(dirname $0)

DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python manage.py makemigrations
DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python manage.py migrate
DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python manage.py collectstatic --noinput

touch decat_geonode/wsgi.py

exit 0

#git pull origin master
#pushd frontend
#npm install
#npm run compile
#popd
#DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python ./manage.py collectstatic --noinput
#DJANGO_SETTINGS_MODULE=decat_geonode.local_settings python ./manage.py migrate


