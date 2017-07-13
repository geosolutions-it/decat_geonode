/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {head} = require('lodash');

const getHazard = (hazards, type) => {
    return head(hazards.filter(h => h.name === type));
};

const getLevel = (levels, name) => {
    return head(levels.filter(h => h.name === name));
};

module.exports = {
    getHazardIcon: (hazards, type) => {
        const hazard = getHazard(hazards, type);
        return hazard && hazard.icon || 'eq';
    },
    getEvent: (state, event) => {
        return {
            id: event.id,
            point: {
                lat: event.geometry.coordinates[1],
                lng: event.geometry.coordinates[0]
            },
            regions: event.properties.regions,
            name: event.properties.title,
            hazard: getHazard(state.hazards, event.properties.hazard_type),
            level: getLevel(state.levels, event.properties.level),
            sourceName: event.properties.source.name,
            description: event.properties.description,
            created: event.properties.created_at,
            reported: event.properties.reported_at,
            updated: event.properties.updated_at
        };
    }
};
