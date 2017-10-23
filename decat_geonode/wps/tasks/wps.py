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
from datetime import datetime
import pytz
from decat_geonode.wps.models import (MAX_STATUS_CHECKS_RETRIES,
                                      MAX_EXECUTION_TIME,
                                      WebProcessingServiceRun,
                                      WebProcessingServiceExecutionError)

logger = getLogger(__name__)


@task(name='decat_geonode.wps.tasks.wps.check_executions_status', queue='update')
def check_executions_status(*args, **kwargs):
    """
    Check Execution Status for all pending Process Runs
    """

    running_processes = WebProcessingServiceRun.objects.filter(execution__status__in=('ProcessAccepted', 'ProcessStarted'))
    for _p in running_processes:
        if _p.status_checks_failed < MAX_STATUS_CHECKS_RETRIES:
            logger.debug("Checking process: " + str(_p.identifier))
            if not _p.is_initialized():
                try:
                    _p.initialize()
                    logger.debug("Initialized process: " + str(_p.identifier))
                except:
                    logger.exception("Could not initialize process: " + str(_p.identifier))
                    _p.status_checks_failed += 1
                    _p.save()
                    continue

            try:
                logger.debug("Checking status of process: " + str(_p.identifier))
                WebProcessingServiceRun.checkStatus(_p)
            except:
                logger.exception("Could not check status of process: " + str(_p.identifier))
                _p.status_checks_failed += 1
                _p.save()

            try:
                logger.debug("Checking execution time of process: " + str(_p.identifier))
                # If running since too much time, put into FAILED state
                d = _p.execution.created_at
                if d.tzinfo is not None and d.tzinfo.utcoffset(d) is not None:
                    u = datetime.utcnow()
                    u = u.replace(tzinfo=pytz.utc)
                else:
                    u = datetime.now()
                delta = u - _p.execution.created_at

                if delta.seconds >= MAX_EXECUTION_TIME:
                    _p.execution.status = 'ProcessFailed'
                    _p.execution.completed = True
                    _p.execution.successful = False
                    _p.execution.failed = True
                    _err_text = "Max execution time of {} seconds exceeded.".format(MAX_EXECUTION_TIME)
                    _err = WebProcessingServiceExecutionError.objects.create(text=_err_text,
                                                                             code=-1,
                                                                             locator='',
                                                                             execution=_p.execution)
                    _p.execution.errors.add(_err)
                    _p.execution.save()
                    _p.save()
            except:
                logger.exception("Could not check execution time of process: " + str(_p.identifier))
                _p.status_checks_failed += 1
                _p.save()

    return running_processes
