/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const union = require('turf-union');
const bbox = require('turf-bbox');
function swapCoords(polygon) {
    return polygon.map((point) => {
        const [lat, lng] = point;
        return [lng, lat];
    });
}
function wrapFeature(geometry, properties = {}, swapLatLng = false) {
    if (swapLatLng) {
        const coordinates = geometry.coordinates.map(polygon => swapCoords(polygon));
        return {
            "type": "Feature",
            properties,
            geometry: {...geometry, coordinates}
        };
    }
    return {
        "type": "Feature",
        properties,
        geometry
    };
}
function getUserRegions({user = {}}) {
        const dataScope = user.data_scope || [];
        return dataScope.reduce((regions, scope) => regions.concat(scope.regions), []);
    }
module.exports = {
    hasDataScopeRegions: action => getUserRegions(action.user).length > 0,
    getUserRegions,
    getRegionsBBox: (regions = []) => {
        // return [[-30, -50, 30, 20]];
        // return [[6.7499552751, 36.619987291, 18.4802470232, 47.1153931748]];
        if (regions.length > 0) {
            return regions.map((region) => bbox(wrapFeature(region.bbox)));
        }
        // generate union of all regions
        // if (regions.length > 0) {
        //     const multyPolygon = regions.reduce((poly, region) => {
        //         return union(poly, wrapFeature(region.bbox));
        //     }, wrapFeature(regions[0].bbox));
        //     return bbox(multyPolygon);
        // }
    }
};
