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

from logging import getLogger
from celery.task import task
from decat_geonode.wps.models import (MAX_STATUS_CHECKS_RETRIES,
                                      WebProcessingServiceRun)

logger = getLogger(__name__)


@task(name='decat_geonode.wps.tasks.wps.check_executions_status', queue='update')
def check_executions_status(*args, **kwargs):
    """
    Check Execution Status for all pending Process Runs
    """
    # TODO: If running since too much time, put into FAILED state
    """
    from datetime import datetime
    import pytz
    u = datetime.utcnow()
    u = u.replace(tzinfo=pytz.utc)
    delta = u - _p.execution.created_at
    delta.seconds
    """

    running_processes = WebProcessingServiceRun.objects.filter(execution__status__in=('ProcessAccepted', 'ProcessStarted'))
    for _p in running_processes:
        if _p._status_checks_failed < MAX_STATUS_CHECKS_RETRIES:
            logger.debug("Checking process: " + str(_p.identifier))
            if not _p.is_initialized():
                try:
                    _p.initialize()
                    logger.debug("Initialized process: " + str(_p.identifier))
                except:
                    logger.debug("Could not initialize process: " + str(_p.identifier))
                    _p._status_checks_failed += 1
                    continue

            try:
                logger.debug("Checking status of process: " + str(_p.identifier))
                WebProcessingServiceRun.checkStatus(_p)
            except:
                logger.debug("Could not check status of process: " + str(_p.identifier))
                _p._status_checks_failed += 1

    return running_processes
