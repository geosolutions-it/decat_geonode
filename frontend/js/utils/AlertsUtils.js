/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {head} = require('lodash');

module.exports = {
    getHazardIcon: (hazards, type) => {
        const hazard = head(hazards.filter(h => h.name === type));
        return hazard && hazard.icon || 'eq';
    }
};
