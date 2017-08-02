/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const union = require('turf-union');
const bbox = require('turf-bbox');

function wrapFeature(geometry, properties = {}) {
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
