/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR, EVENTS_LOADED, EVENTS_LOAD_ERROR} = require('../actions/alerts');

const assign = require('object-assign');

function alerts(state = null, action) {
    switch (action.type) {
    case DATA_LOADED:
        return assign({}, state, {
            [action.entity]: action.data.map((d) => assign({}, d, {
                selected: true
            }))
        });
    case DATA_LOAD_ERROR:
        return assign({}, state, {
            dataError: action.error,
            entityOnError: action.entity
        });
    case REGIONS_LOADED:
        return assign({}, state, {
            regions: action.regions
        });
    case REGIONS_LOAD_ERROR:
        return assign({}, state, {
            regionsError: action.error
        });
    case EVENTS_LOADED:
        return assign({}, state, {
            events: action.events
        });
    case EVENTS_LOAD_ERROR:
        return assign({}, state, {
            eventsError: action.error
        });
    default:
        return state;
    }
}

module.exports = alerts;
