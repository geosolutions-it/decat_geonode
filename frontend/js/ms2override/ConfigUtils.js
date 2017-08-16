/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const defualtLayers = require('./decatDefaultLayers');
ConfigUtils.convertFromLegacy = function(config) {
    return ConfigUtils.convertFromGeonode(config);
};
ConfigUtils.convertFromGeonode = function(config) {
    var mapConfig = config.map;
    var sources = config.gsSources || config.sources;
    var layers = mapConfig.layers.filter(layer => layer.type !== "OpenLayers.Layer").filter(layer => sources[layer.source]);
    var latLng = ConfigUtils.getCenter(mapConfig.center, mapConfig.projection);
    var zoom = mapConfig.zoom;
    var maxExtent = mapConfig.maxExtent || mapConfig.extent;
    // setup layers and sources with defaults
    this.setupSources(sources, config.defaultSourceType);
    this.setupLayers(layers, sources, ["gxp_osmsource", "gxp_wmssource", "gxp_wmscsource", "gxp_googlesource", "gxp_bingsource", "gxp_mapquestsource", "gxp_olsource"]);
    layers = layers.map((l) => ConfigUtils.normalizeGeonodeLayer(l));
    return ConfigUtils.normalizeConfig({
        center: latLng,
        zoom: zoom,
        maxExtent: maxExtent, // TODO convert maxExtent
        layers,
        projection: mapConfig.projection || 'EPSG:3857'
    });
};
ConfigUtils.normalizeGeonodeLayer = function(layer) {
    layer.type = layer.type === 'wmsc' && 'wms' || layer.type;
    if (["osm", "google", "bing", "mapquest", "ol"].indexOf(layer.type) !== -1) {
        layer.source = layer.type;
    }
    Object.keys(layer.baseParams || {}).forEach((prop) => {
        if (prop === 'REQUEST' || prop === 'VERSION' || prop === 'SERVICE') {
            delete layer.baseParams[prop];
        }
    });
    return layer;
};
ConfigUtils.normalizeConfig = function(config) {
    const {layers, groups, plugins, ...other} = config;
    other.center = ConfigUtils.getCenter(other.center);
    const currentRole = this.getConfigProp('currentRole');
    return {
        map: other,
        layers: layers.concat(defualtLayers[currentRole] || []).map(ConfigUtils.setApiKeys, config).map(ConfigUtils.setLayerId).map(ConfigUtils.setUrlPlaceholders),
        groups: groups,
        plugins: plugins
    };
};

module.exports = ConfigUtils;
