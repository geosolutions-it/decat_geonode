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

from paver.easy import task, options, cmdopts, needs
from paver.easy import path, sh, info, call_task
from paver.easy import BuildFailure

try:
    from decat_geonode.settings import GEONODE_APPS
except:
    # probably trying to run install_win_deps.
    pass

try:
    from paver.path import pushd
except ImportError:
    from paver.easy import pushd


@task
def build_static(options):
    sh('git submodule init')
    sh('git submodule update')
    sh('git pull')
    with pushd('frontend'):
        sh('npm install')
        sh('npm run compile')
    sh('mkdir -p decat_geonode/static/decat/')
    sh('cp -vr frontend/dist/* decat_geonode/static/decat/')
    sh('cp -vr frontend/static/decat/* decat_geonode/static/decat/')
    sh('mkdir -p decat_geonode/static/decat/MapStore2/web/client/translations/')
    sh('cp -vr frontend/MapStore2/web/client/translations/* decat_geonode/static/decat/MapStore2/web/client/translations/')
    sh('python manage.py collectstatic --noinput')
    

@task
def update(options):
    build_static()
    sh('python manage.py migrate')
