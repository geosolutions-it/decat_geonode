/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../../MapStore2/web/client/libs/ajax');

const DATA_LOADED = 'DATA_LOADED';
const DATA_LOAD_ERROR = 'DATA_LOAD_ERROR';
const REGIONS_LOADED = 'REGIONS_LOADED';
const REGIONS_LOAD_ERROR = 'REGIONS_LOAD_ERROR';
const EVENTS_LOADED = 'EVENTS_LOADED';
const EVENTS_LOAD_ERROR = 'EVENTS_LOAD_ERROR';

function dataLoaded(entity, data) {
    return {
        type: DATA_LOADED,
        entity,
        data
    };
}

function dataLoadError(entity, e) {
    return {
        type: DATA_LOAD_ERROR,
        entity,
        error: e
    };
}

function loadHazards(url = '/decat/api/hazard_types') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(dataLoaded('hazards', response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(dataLoadError('hazards', 'API error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(dataLoadError('hazards', e));
        });
    };
}

function loadLevels(url = '/decat/api/alert_levels') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(dataLoaded('levels', response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(dataLoadError('levels', 'API error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(dataLoadError('levels', e));
        });
    };
}

function regionsLoaded(regions) {
    return {
        type: REGIONS_LOADED,
        regions: regions.results
    };
}

function regionsLoadError(e) {
    return {
        type: REGIONS_LOAD_ERROR,
        error: e
    };
}
function loadRegions(url = '/decat/api/regions') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(regionsLoaded(response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(regionsLoadError('API error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(dataLoadError(e));
        });
    };
}

function eventsLoaded(events) {
    return {
        type: EVENTS_LOADED,
        events: events.features
    };
}

function eventsLoadError(e) {
    return {
        type: EVENTS_LOAD_ERROR,
        error: e
    };
}
function loadEvents(url = '/decat/api/alerts') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(eventsLoaded(response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(eventsLoadError('API error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(eventsLoadError(e));
        });
    };
}

module.exports = {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR,
    EVENTS_LOADED, EVENTS_LOAD_ERROR,
    loadHazards, loadLevels, loadRegions, loadEvents};
