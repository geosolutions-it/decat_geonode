/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const {Promise} = require('es6-promise');
const assign = require('object-assign');
const {head} = require('lodash');
const uuid = require('uuid');
const Proj4js = require('proj4');
const CoordinatesUtils = require("../../MapStore2/web/client/utils/CoordinatesUtils");
const MapUtils = require("../../MapStore2/web/client/utils/MapUtils");
const epsg4326 = Proj4js ? new Proj4js.Proj('EPSG:4326') : null;
const decatDefaultLayers = require('../ms2override/decatDefaultLayers') || [];
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');

const saveLayer = (layer) => {
    return {
        capability: layer.capability,
        cached: layer.cached,
        features: layer.features,
        format: layer.format,
        group: layer.group,
        search: layer.search,
        source: layer.source,
        name: layer.name,
        opacity: layer.opacity,
        provider: layer.provider,
        styles: layer.styles,
        style: layer.style,
        availableStyles: layer.availableStyles,
        capabilitiesURL: layer.capabilitiesURL,
        title: layer.title,
        transparent: layer.transparent,
        tiled: layer.tiled,
        bbox: layer.bbox,
        visibility: layer.visibility,
        singleTile: layer.singleTile || false,
        allowedSRS: layer.allowedSRS,
        matrixIds: layer.matrixIds,
        tileMatrixSet: layer.tileMatrixSet,
        dimensions: layer.dimensions || [],
        ...assign({}, layer.params ? {params: layer.params} : {})
    };
};
function projectCenter(center, mapProjection) {
    let xy = Proj4js.toPoint([center.x, center.y]);
    if (center.crs !== mapProjection) {
        const epsgMap = new Proj4js.Proj(mapProjection);
        Proj4js.transform(epsg4326, epsgMap, xy);
    }
    return [xy.x, xy.y];
}
function getSource(layer) {
    return {
            ptype: "gxp_wmscsource",
            title: "",
            url: layer.url
        };
}

function getCenterAndZoomForExtent(extent, size, bbox, crs = "EPSG:4326", projection = "EPSG:4326") {
    let zoom = 0;
    let bounds = CoordinatesUtils.reprojectBbox(extent, crs, bbox && bbox.crs || "EPSG:4326");
    if (bounds) {
            // center by the max. extent defined in the map's config
        let center = CoordinatesUtils.reproject(MapUtils.getCenterForExtent(extent, crs), crs, 'EPSG:4326');
            // workaround to get zoom 0 for -180 -90... - TODO do it better
        let full = crs === "EPSG:4326" && extent && extent[0] <= -180 && extent[1] <= -90 && extent[2] >= 180 && extent[3] >= 90;
        if ( full ) {
            zoom = 1;
        } else {
            let mapBBounds = CoordinatesUtils.reprojectBbox(extent, crs, projection);
                // NOTE: STATE should contain size !!!
            zoom = MapUtils.getZoomForExtent(mapBBounds, size, 0, 21, null) + 1;
        }
        let newbounds = {minx: bounds[0], miny: bounds[1], maxx: bounds[2], maxy: bounds[3]};
        let newbbox = assign({}, bbox, {bounds: newbounds});
        return {
            center,
            zoom,
            bbox: newbbox
        };
    }
}
function _rebound(left, right) {
    return left + right > 0 ?
        Math.round(left - right) / 2 :
        Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
}
function isNearlyEqual(a, b) {
    if (a === undefined || b === undefined) {
        return false;
    }
    return a.toFixed(8) - b.toFixed(8) === 0;
}
module.exports = {
    getGeoNodeMapConfig: ( map, layers, currentGeoNodeConfig, metadata, id) => {
        let newMap =
            {
                center: projectCenter(map.center, map.projection),
                maxExtent: map.maxExtent,
                projection: map.projection,
                units: map.units,
                zoom: map.zoom
            };
        let sources = currentGeoNodeConfig.config.sources;
        const currentRole = ConfigUtils.getConfigProp('currentRole');
        const decatLayers = decatDefaultLayers[currentRole] || [];
        let newLayers = layers.filter((layer) => !layer.id || !decatLayers.filter((dl) => dl.id === layer.id).length > 0).map((layer) => {
            let newLayer = saveLayer(layer);
            // If source is missing Il search in sources by url to see if one match
            if (!layer.source) {

                let source = head(Object.keys(sources).filter((k) => sources[k].url === layer.url));
                if (source) {
                    newLayer = assign({}, layer, {source: source});
                }else {
                    const uid = uuid.v1();
                    newLayer = assign({}, newLayer, {source: `${uid}`});
                    sources = assign({}, sources, {[`${uid}`]: getSource(layer)});
                }
            }
            return newLayer;
        });
        return {
            // layers are defined inside the map object
            map: assign({}, newMap, {layers: newLayers}),
            sources: sources,
            about: metadata || currentGeoNodeConfig.config.about,
            id: id || currentGeoNodeConfig.id,
            aboutUrl: currentGeoNodeConfig.config.aboutUrl,
            defaultSourceType: currentGeoNodeConfig.config.defaultSourceType
        };
    },
    getDefaultMap: (maps = [], roles = []) => {
        return roles.reduce((mapId, role) => {
            return mapId ? mapId : (head(maps.filter((map) => map.role === role)) || {}).map;
        }, false);
    },
    getCenterAndZoomForExtent: (extent, size, bbox, crs = "EPSG:4326", projection = "EPSG:4326") => {
        return getCenterAndZoomForExtent(extent, size, bbox, crs, projection);
    },
    bboxToExtent: ({bounds= {}}) => {
        return Object.keys(bounds).map(v => {
            if (typeof bounds[v] === 'string' || bounds[v] instanceof String) {
                return Number(bounds[v]);
            }
            return bounds[v];
        });
    },
    limitCenter: (extent, center, size, projection) => {
        const getPixel = MapUtils.getHook(MapUtils.GET_PIXEL_FROM_COORDINATES_HOOK);
        const getPoint = MapUtils.getHook(MapUtils.GET_COORDINATES_FROM_PIXEL_HOOK);
        const centerPoint = getPixel(CoordinatesUtils.reproject(center, "EPSG:4326", projection));
        const extentNW = getPixel(CoordinatesUtils.reproject([extent[0], extent[3]], "EPSG:4326", projection));
        const extentSE = getPixel(CoordinatesUtils.reproject([extent[2], extent[1]], "EPSG:4326", projection));
        const nwOffset = {x: extentNW[0] - 0, y: extentNW[1] - 0};
        const seOffset = {x: extentSE[0] - size.width, y: extentSE[1] - size.height};
        const dx = _rebound(nwOffset.x, -seOffset.x);
        const dy = _rebound(nwOffset.y, -seOffset.y);
        if (dx !== 0 || dy !== 0) {
            let newCenter = CoordinatesUtils.reproject(getPoint([ centerPoint[0] + dx, centerPoint[1] + dy ]), projection, "EPSG:4326");
            newCenter.crs = "EPSG:4326";
            return newCenter;
        }
    },
    isNearlyEqualPoint: ({x: xa, y: ya}, {x: xb, y: yb}) => {
        return isNearlyEqual(xa, xb) && isNearlyEqual(ya, yb);
    }
};
