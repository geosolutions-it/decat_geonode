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
const LOAD_REGIONS = 'LOAD_REGIONS';
const REGIONS_LOADING = 'REGIONS_LOADING';
const EVENTS_LOADED = 'EVENTS_LOADED';
const EVENTS_LOAD_ERROR = 'EVENTS_LOAD_ERROR';
const SELECT_REGIONS = 'SELECT_REGIONS';
const RESET_REGIONS_SELECTION = 'RESET_REGIONS_SELECTION';

const ADD_EVENT = 'ADD_EVENT';
const CHANGE_EVENT_PROPERTY = 'CHANGE_EVENT_PROPERTY';
const TOGGLE_EVENT = 'TOGGLE_EVENT';

const TOGGLE_DRAW = 'TOGGLE_DRAW';
const CANCEL_EDIT = 'CANCEL_EDIT';
const EVENT_SAVED = 'EVENT_SAVED';
const EVENT_SAVE_ERROR = 'EVENT_SAVE_ERROR';
const EVENT_SAVING = 'EVENT_SAVING';

const {CLICK_ON_MAP} = require('../../MapStore2/web/client/actions/map');

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

function loadSourceTypes(url = '/decat/api/alert_sources/types') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(dataLoaded('sourceTypes', response.data));
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(dataLoadError('sourceTypes', 'API error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(dataLoadError('sourceTypes', e));
        });
    };
}

function regionsLoaded(regions, concatOptions = false) {
    return {
        type: REGIONS_LOADED,
        regions: regions,
        concatOptions
    };
}
function regionsLoading(loading = true) {
    return {
        type: REGIONS_LOADING,
        loading
    };
}
function regionsLoadError(e) {
    return {
        type: REGIONS_LOAD_ERROR,
        error: e
    };
}
function loadRegions(url = '/decat/api/regions', nextPage = false, searchText) {
    return {
        type: LOAD_REGIONS,
        url,
        searchText,
        nextPage
    };
}

function eventsLoaded(events, page = 0) {
    return {
        type: EVENTS_LOADED,
        events: events.features,
        total: events.count,
        page
    };
}

function eventsLoadError(e) {
    return {
        type: EVENTS_LOAD_ERROR,
        error: e
    };
}
function loadEvents(url = '/decat/api/alerts', page = 0) {
    return (dispatch) => {
        return axios.get(url + '?page=' + (page + 1)).then((response) => {
            if (typeof response.data === 'object') {
                dispatch(eventsLoaded(response.data, page));
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
function selectRegions(regions) {
    return {
        type: SELECT_REGIONS,
        selectedRegions: regions
    };
}
function resetRegionsSelection() {
    return {
        type: RESET_REGIONS_SELECTION
    };
}

function addEvent() {
    return (dispatch) => {
        dispatch({
            type: CLICK_ON_MAP,
            clickPoint: null
        });
        dispatch({
            type: ADD_EVENT
        });
    };
}

function changeEventProperty(property, value) {
    return {
        type: CHANGE_EVENT_PROPERTY,
        property,
        value
    };
}

function toggleDraw() {
    return (dispatch) => {
        dispatch({
            type: CLICK_ON_MAP,
            clickPoint: null
        });
        dispatch({
            type: TOGGLE_DRAW
        });
    };
}

function cancelEdit() {
    return {
        type: CANCEL_EDIT
    };
}

function eventSaved(data) {
    return {
        type: EVENT_SAVED,
        data
    };
}

function eventSaveError(error) {
    return {
        type: EVENT_SAVE_ERROR,
        error
    };
}


function eventSaving(status) {
    return {
        type: EVENT_SAVING,
        status
    };
}

function saveEvent(mode, url = '/decat/api/alerts/') {
    return (dispatch, getState) => {
        dispatch(eventSaving(true));
        const currentEvent = getState().alerts.currentEvent || {};
        const alertInfo = {
            geometry: {
                type: "Point",
                coordinates: [currentEvent.point && currentEvent.point.lat, currentEvent.point && currentEvent.point.lng]
            },
            type: "Feature",
            properties: {
                description: currentEvent.description,
                level: currentEvent.level && currentEvent.level.name || null,
                title: currentEvent.name || '',
                name: currentEvent.name || '',
                regions: currentEvent.regions || [],
                source: {
                    type: currentEvent.sourceType || null,
                    name: currentEvent.sourceName || null,
                    uri: currentEvent.sourceUri || null
                },
                hazard_type: currentEvent.hazard && currentEvent.hazard.name || null
            }
        };
        axios.post(url, alertInfo, {
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            dispatch(eventSaved(response.data));
            dispatch(loadEvents());
            dispatch(cancelEdit());
        }).catch((e) => {
            dispatch(eventSaveError(e));
        });
    };
}

function toggleEventVisibility(event) {
    return {
        type: TOGGLE_EVENT,
        event
    };
}

module.exports = {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR, REGIONS_LOADING,
    EVENTS_LOADED, EVENTS_LOAD_ERROR, LOAD_REGIONS, RESET_REGIONS_SELECTION, SELECT_REGIONS,
    ADD_EVENT, CHANGE_EVENT_PROPERTY, TOGGLE_DRAW, CANCEL_EDIT, EVENT_SAVED, EVENT_SAVE_ERROR, EVENT_SAVING,
    TOGGLE_EVENT,
    loadHazards, loadLevels, loadRegions, loadSourceTypes, loadEvents, regionsLoaded, regionsLoadError, regionsLoading, selectRegions, resetRegionsSelection,
    addEvent, changeEventProperty, toggleDraw, cancelEdit, saveEvent, toggleEventVisibility};
