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
var Proj4js = require('proj4');
const epsg4326 = Proj4js ? new Proj4js.Proj('EPSG:4326') : null;
const decatDefaultLayers = require('../ms2override/decatDefaultLayers') || [];
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
        let newLayers = layers.filter((layer) => !layer.id || !decatDefaultLayers.filter((dl) => dl.id === layer.id).length > 0).map((layer) => {
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
    }
};
