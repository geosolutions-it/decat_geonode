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
import posixpath
# import shapefile
import anyjson
import urllib
import zipfile
import fnmatch
import uuid
import os

from osgeo import ogr, osr
from urllib import quote

from django.db import models
from django.conf import settings
from django.conf.urls.static import static
from django.utils.translation import ugettext_lazy as _

from model_utils.managers import InheritanceManager

log = logging.getLogger(__name__)


class WebProcessingServiceExecutionOutputHook(models.Model):

    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True, blank=True)

    objects = InheritanceManager()

    def process_output(self, data, **kwargs):
        pass

    def get_children(self):
        rel_objs = self._meta.get_all_related_objects()
        return [getattr(self, x.get_accessor_name()) for x in rel_objs if x.model != type(self)]

    def __init__(self, *args, **kwargs):
        super(WebProcessingServiceExecutionOutputHook, self).__init__(*args, **kwargs)

    def __unicode__(self):
       return '{}: {}'.format(self.__class__.__name__, self.name)


class GeoJsonWrapperHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        try:
            data = anyjson.loads(data)
        except ValueError as exc:
            raise forms.ValidationError(
                _('Unable to parse JSON: %s') % exc,
            )

        return data


class UrlFixHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        # percent encode url, fixing lame server errors for e.g, like space
        # within url paths.
        data = posixpath.join(*data.strip().split('\\'))
        data = quote(data, safe="%/:=&?~#+!$,;'@()*[]")

        return data


class UrlDownloadHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        try:
            _url = UrlFixHook().process_output(data)
            _base_name = posixpath.basename(_url)
            _tmp_path = posixpath.join(settings.MEDIA_ROOT, str(uuid.uuid4()))
            os.makedirs(_tmp_path)
            _tmp_path = posixpath.join(_tmp_path, _base_name)

            _tmp_file = urllib.URLopener()
            _f,_m = _tmp_file.retrieve(_url, _tmp_path)
            data = _f
        except:
            log.exception("Could not Download from {}".format(data))

        return data


class UnzipFileHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        try:
            _base_name = posixpath.basename(data)
            _tmp_path = posixpath.join(settings.MEDIA_ROOT, str(uuid.uuid4()))
            os.makedirs(_tmp_path)
            _zip_ref = zipfile.ZipFile(data, 'r')
            _zip_ref.extractall(_tmp_path)
            _zip_ref.close()

            _files = []
            for _f in os.listdir(_tmp_path):
                if fnmatch.fnmatch(_f, '{}.*'.format(posixpath.splitext(_base_name)[0])):
                    _files.append(posixpath.join(_tmp_path, posixpath.basename(_f)))

            return anyjson.dumps(_files)
        except:
            log.exception("Could not Unzip {}".format(data))

        return data


class UnzipDownloadHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        data = UrlDownloadHook().process_output(data)
        data = UnzipFileHook().process_output(data)

        try:
            data = anyjson.loads(data)
        except:
            log.exception("Could not JSON Load {}".format(data))
            data = data

        if isinstance(data, basestring):
            if data.startswith(settings.MEDIA_ROOT):
                data = posixpath.join(settings.MEDIA_URL, data.split(settings.MEDIA_ROOT)[1].strip("/"))
        else:
            try:
                for idx, val in enumerate(data):
                    if val.startswith(settings.MEDIA_ROOT):
                        data[idx] = posixpath.join(settings.MEDIA_URL, val.split(settings.MEDIA_ROOT)[1].strip("/"))
            except:
                pass

        try:
            return anyjson.dumps(data)
        except:
            log.exception("Could not JSON Dump {}".format(data))
            return data


class ShapefileDownloadHook(WebProcessingServiceExecutionOutputHook):

    def process_output(self, data, **kwargs):
        data = UnzipDownloadHook().process_output(data)

        try:
            data = anyjson.loads(data)
        except:
            log.exception("Could not JSON Load {}".format(data))
            data = data

        _shp_file = None
        if isinstance(data, basestring):
            _data = data
            if data.startswith(settings.MEDIA_URL):
                _data = posixpath.join(settings.MEDIA_ROOT, data.split(settings.MEDIA_URL)[1].strip("/"))
            if fnmatch.fnmatch(_data.lower(), '*.shp'):
                _shp_file = _data
        else:
            try:
                for idx, val in enumerate(data):
                    if val.startswith(settings.MEDIA_URL):
                        _data = posixpath.join(settings.MEDIA_ROOT, val.split(settings.MEDIA_URL)[1].strip("/"))
                        if fnmatch.fnmatch(_data.lower(), '*.shp'):
                            _shp_file = _data
            except:
                pass

        try:
            if _shp_file:
                return self.dump_shp_to_json(_shp_file)
        except:
            log.exception("Could not JSON Dump {}".format(data))

        return data

    def dump_shp_to_json(self, shp_file):
        try:
            # reader = shapefile.Reader(shp_file)
            # fields = reader.fields[1:]
            # field_names = [field[0] for field in fields]
            #
            # buffer = []
            # for sr in reader.shapeRecords():
            #     atr = dict(zip(field_names, sr.record))
            #     geom = sr.shape.__geo_interface__
            #     buffer.append(dict(type="Feature", geometry=geom, properties=atr))

            driver = ogr.GetDriverByName('ESRI Shapefile')
            dataset = driver.Open(shp_file)

            # from Layer
            layer = dataset.GetLayer()
            spatialRef = layer.GetSpatialRef()

            # from Geometry
            feature = layer.GetNextFeature()
            geom = feature.GetGeometryRef()
            spatialRef = geom.GetSpatialReference()

            # input SpatialReference
            if spatialRef:
                inSpatialRef = spatialRef
            else:
                inSpatialRef = osr.SpatialReference()
                inSpatialRef.ImportFromEPSG(900913)

            # output SpatialReference
            outSpatialRef = osr.SpatialReference()
            outSpatialRef.ImportFromEPSG(4326)

            # create the CoordinateTransformation
            coordTrans = osr.CoordinateTransformation(inSpatialRef, outSpatialRef)

            # loop through the input features
            buffer = []
            inLayerDefn = layer.GetLayerDefn()
            for ft_idx in range(0, layer.GetFeatureCount()):
                inFeature = layer.GetFeature(ft_idx)
                field_names = []
                field_values = []
                for i in range(0, inFeature.GetFieldCount()):
                    field_names.append(inLayerDefn.GetFieldDefn(i).GetNameRef())
                    field_values.append(inFeature.GetField(i))
                atr = dict(zip(field_names, field_values))
                # get the input geometry
                geom = inFeature.GetGeometryRef()
                # reproject the geometry
                geom.Transform(coordTrans)
                buffer.append(dict(type="Feature", geometry=geom.ExportToJson(), properties=atr))

            crs = {
                "type": "name",
                "properties": {
                    "name": "EPSG:4326"
                }
            }
            extent = layer.GetExtent().Transform(coordTrans)
            # Create a Polygon from the extent tuple
            ring = ogr.Geometry(ogr.wkbLinearRing)
            ring.AddPoint(extent[0], extent[2])
            ring.AddPoint(extent[1], extent[2])
            ring.AddPoint(extent[1], extent[3])
            ring.AddPoint(extent[0], extent[3])
            ring.AddPoint(extent[0], extent[2])
            poly = ogr.Geometry(ogr.wkbPolygon)
            poly.AddGeometry(ring)
            poly.Transform(coordTrans)
            minX, maxX, minY, maxY = poly.GetEnvelope()

            return anyjson.dumps({"type": "FeatureCollection",
                                  "bbox": [minX, minY, maxX, maxY],
                                  "crs": crs,
                                  "features": buffer})
        except:
            log.exception("Could not JSON Dump Shapefile {}".format(shp_file))
            return shp_file


PLUGINS = ((GeoJsonWrapperHook, 'geo-json-wrapper'),
           (UrlFixHook, 'url-fix'),
           (UrlDownloadHook, 'url-download'),
           (UnzipFileHook, 'unzip-file'),
           (UnzipDownloadHook, 'unzip-download'),
           (ShapefileDownloadHook, 'shp-file-download'),)

def populate():
    for cls, name in PLUGINS:
        obj, _ = cls.objects.get_or_create(name=name)
        if _:
            obj.save()
