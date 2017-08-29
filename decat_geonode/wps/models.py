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

import logging
import json

from django.db import models
from django.core.files import File

from .validators import validate_file_extension
from .signals import wps_run_complete

from owslib.wps import (WebProcessingService, WPSExecution, get_namespaces)
from owslib.util import (getNamespace, element_to_string, nspath, openURL,
                         nspath_eval, log, testXMLValue, build_get_url, dump, getTypedValue)

from owslib.etree import etree

namespaces = get_namespaces()

wps_ns = namespaces.pop(None)
if wps_ns:
    namespaces['wps'] = wps_ns

MAX_STATUS_CHECKS_RETRIES = 30

MAX_EXECUTION_TIME = 1200 # in seconds

log = logging.getLogger(__name__)


class WebProcessingServiceExecutionOutput(models.Model):
    title = models.CharField(max_length=255, null=True, blank=True)
    abstract = models.TextField(null=True, blank=True)
    identifier = models.CharField(max_length=4096, null=True, blank=True)
    data = models.TextField(null=True, blank=True)

    execution = models.ForeignKey('WebProcessingServiceExecution', on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        super(WebProcessingServiceExecutionOutput, self).__init__(*args, **kwargs)

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.identifier)


class WebProcessingServiceExecutionError(models.Model):
    text = models.TextField(null=True, blank=True)
    code = models.CharField(max_length=255, null=True, blank=True)
    locator = models.CharField(max_length=4096, null=True, blank=True)

    execution = models.ForeignKey('WebProcessingServiceExecution', on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        super(WebProcessingServiceExecutionError, self).__init__(*args, **kwargs)

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.code)


class WebProcessingServiceExecution(models.Model):
    created_at = models.DateTimeField(null=False, blank=False, auto_now_add=True)
    updated_at = models.DateTimeField(null=False, blank=False, auto_now=True)
    request = models.TextField(null=True, blank=True)
    response = models.TextField(null=True, blank=True)
    status_location = models.CharField(max_length=4096, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    percent_completed = models.DecimalField(max_digits=11, decimal_places=2,
                                            blank=True, null=True, default=0.0)
    completed = models.BooleanField(null=False, default=False)
    successful = models.BooleanField(null=False, default=False)
    failed = models.BooleanField(null=False, default=False)

    process = models.ForeignKey('WebProcessingServiceRun')

    errors = models.ManyToManyField(WebProcessingServiceExecutionError, blank=True)

    processOutputs = models.ManyToManyField(WebProcessingServiceExecutionOutput, blank=True)

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.status)


class WebProcessingServiceRun(models.Model):
    identifier = models.CharField(max_length=255, null=False, blank=False)
    title = models.TextField(null=False, blank=True, default='')
    abstract = models.TextField(null=False, blank=True, default='')
    username = models.CharField(max_length=255, null=True, blank=True)
    password = models.CharField(max_length=255, null=True, blank=True)
    url = models.CharField(max_length=4096, null=False, blank=False)
    version = models.CharField(max_length=255, null=False, blank=False)
    service_instance = models.CharField(max_length=4096, null=False, blank=True, default='')
    status_checks_failed = models.IntegerField(default=0)

    request_template = models.FileField(upload_to="wpsrequests/%Y/%m/%d", validators=[validate_file_extension])

    execution = models.ForeignKey(WebProcessingServiceExecution, null=True, blank=True, on_delete=models.CASCADE)

    def __init__(self, *args, **kwargs):
        super(WebProcessingServiceRun, self).__init__(*args, **kwargs)
        self._initialized = False
        self._execution_response = None
        self._wps = None

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.identifier)

    def is_initialized(self):
        return self._initialized

    def initialize(self):
        if not self.is_initialized():
            try:
                wps = WebProcessingService(self.url,
                                           username=self.username,
                                           password=self.password,
                                           verbose=False,
                                           skip_caps=False)
                process = wps.describeprocess(self.identifier)

                if process:
                    self.title = self.title or process.title
                    self.abstract = self.abstract or process.abstract
                    self.version = self.version or wps.version
                    self.service_instance = wps.url
                    self.save()
                    self._initialized = True
                    self._wps = wps
                    self._execution_response = WebProcessingServiceRun.getOWSLibExecutionResponse(self)
            except:
                self._initialized = False
                self._wps = None

    @classmethod
    def create_from_process(cls, url, identifier, request_template, username=None, password=None):
        try:
            wps = WebProcessingService(url,
                                       username=username,
                                       password=password,
                                       verbose=False,
                                       skip_caps=False)
            process = wps.describeprocess(identifier)

            if process:
                _f = open(request_template)
                _run = cls.objects.create(identifier=identifier,
                                          title=process.title,
                                          abstract=process.abstract,
                                          version=wps.version,
                                          url=url,
                                          service_instance=wps.url,
                                          username=username,
                                          password=password,
                                          request_template=File(_f))
                _run._initialized = True
                _run._wps = wps
                return _run
        except:
            log.exception("Could not create Process!")
            raise

        return wps.id

    @classmethod
    def _update_instance_execution_status(cls, instance, execution):
        if not instance.execution.completed:
            _e = execution
            instance.execution.request = _e.request
            instance.execution.response = _e.response
            instance.execution.status = _e.status
            instance.execution.status_location = _e.statusLocation
            if _e.percentCompleted:
                if isinstance(_e.percentCompleted, float):
                    instance.execution.percent_completed = _e.percentCompleted
                else:
                    try:
                        from decimal import Decimal
                        instance.execution.percent_completed = Decimal(_e.percentCompleted)
                    except:
                        instance.execution.percent_completed = 0.0

            _is_completed = False
            try:
                _is_completed = _e.isComplete()
            except:
                _is_completed = False

            if _is_completed:
                instance.execution.completed = True
                _is_succeded = False
                try:
                    _is_succeded = _e.isSucceded()
                except:
                    _is_succeded = False

                if _is_succeded:
                    instance.execution.successful = True
                    instance.execution.percent_completed = 100.0
                else:
                    instance.execution.failed = True

            try:
                if _e.errors and instance.execution.errors.count() == 0:
                    for _err in _e.errors:
                        _e = WebProcessingServiceExecutionError.objects.create(text=_err.text,
                                                                               code=_err.code,
                                                                               locator=_err.locator,
                                                                               execution=instance.execution)
                        instance.execution.errors.add(_e)
            except:
                log.exception("Could not update {} Execution Errors".format(instance))

            try:
                if _e.processOutputs and instance.execution.processOutputs.count() == 0:
                    for _out in _e.processOutputs:
                        _o = WebProcessingServiceExecutionOutput.objects.create(title=_out.title,
                                                                                abstract=_out.abstract,
                                                                                identifier=_out.identifier,
                                                                                data=json.dumps(_out.data),
                                                                                execution=instance.execution)
                        # TODO: parse output data using process outputs hooks
                        instance.execution.processOutputs.add(_o)
            except:
                log.exception("Could not update {} Execution Process Outputs".format(instance))

            instance.execution.save()
            instance.save()

            # notify listeners
            if _is_completed:
                wps_run_complete.send(sender=cls, wps_run=instance)

    @classmethod
    def execute(cls, instance, inputs=[]):
        """
        e.g.: inputs = [("latitude","45.06"), ("longitude","6.34"), ("magnitude","8.5")]
        """
        if not instance.is_initialized():
            exception = Exception("Not initialized!")
            log.exception("Not initialized!")
            raise exception

        if instance.execution and isinstance(instance.execution, WebProcessingServiceExecution) and instance.execution.response:
            return instance.execution.status
        else:
            instance.execution = WebProcessingServiceExecution.objects.create(process=instance)

        _req = etree.fromstring(instance.request_template.read())
        _inputs = _req.xpath('.//wps:DataInputs/wps:Input', namespaces=namespaces)
        for (key, val) in inputs:
            for _i in _inputs:
                try:
                    identifier = _i.xpath('./ows:Identifier', namespaces=namespaces)[0].text
                    if key in identifier:
                        _i.xpath('./wps:Data/wps:LiteralData', namespaces=namespaces)[0].text = val
                except:
                    pass

        _req = etree.tostring(_req)
        _e = instance._wps.execute(None, [], request=_req)
        cls._update_instance_execution_status(instance, _e)
        return instance.execution.status

    @classmethod
    def checkStatus(cls, instance):
        if not instance.is_initialized():
            exception = Exception("Not initialized!")
            log.exception("Not initialized!")
            raise exception

        if instance.execution and isinstance(instance.execution, WebProcessingServiceExecution) and instance.execution.response:
            _e = WPSExecution(version=instance.version,
                              url=instance.url,
                              username=instance.username,
                              password=instance.password,
                              verbose=False)
            _e.request = instance.execution.request
            _e.statusLocation = instance.execution.status_location
            _e.serviceInstance = instance.service_instance
            try:
                _e.checkStatus(sleepSecs=3)
            except:
                log.exception("Exception while Checking WPS Execution Status {}".format(_e))
            cls._update_instance_execution_status(instance, _e)
            return instance.execution.status
        else:
            exception = Exception("No running executions!")
            log.exception("No running executions!")
            raise exception

    @classmethod
    def getOWSLibExecutionResponse(cls, instance):
        _e = None
        if instance.execution.response:
            _e = WPSExecution()
            try:
                _e.checkStatus(url=instance.url, response=str(instance.execution.response), sleepSecs=0)
            except:
                pass

        return _e
