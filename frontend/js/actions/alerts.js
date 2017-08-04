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

const LOAD_EVENTS = 'LOAD_EVENTS';
const LOAD_PROMOTED_EVENTS = 'LOAD_PROMOTED_EVENTS';
const LOAD_ARCHIVED_EVENTS = 'LOAD_ARCHIVED_EVENTS';
const EVENTS_LOADING = 'EVENTS_LOADING';
const EVENTS_LOADED = 'EVENTS_LOADED';
const EVENTS_LOAD_ERROR = 'EVENTS_LOAD_ERROR';

const SELECT_REGIONS = 'SELECT_REGIONS';
const RESET_REGIONS_SELECTION = 'RESET_REGIONS_SELECTION';

const TOGGLE_ENTITY_VALUE = 'TOGGLE_ENTITY_VALUE';
const TOGGLE_ENTITIES = 'TOGGLE_ENTITIES';

const ADD_EVENT = 'ADD_EVENT';
const EDIT_EVENT = 'EDIT_EVENT';
const CHANGE_EVENT_PROPERTY = 'CHANGE_EVENT_PROPERTY';
const TOGGLE_EVENT = 'TOGGLE_EVENT';

const TOGGLE_DRAW = 'TOGGLE_DRAW';
const CANCEL_EDIT = 'CANCEL_EDIT';

const EVENT_CREATED = 'EVENT_CREATED';
const EVENT_PROMOTED = 'EVENT_PROMOTED';
const EVENT_UPDATED = 'EVENT_UPDATED';
const EVENT_ARCHIVED = 'EVENT_ARCHIVED';
const EVENT_SAVE_ERROR = 'EVENT_SAVE_ERROR';
const EVENT_SAVING = 'EVENT_SAVING';

const SEARCH_TEXT_CHANGE = 'SEARCH_TEXT_CHANGE';
const RESET_ALERTS_TEXT_SEARCH = 'RESET_ALERTS_TEXT_SEARCH';

const CHANGE_INTERVAL = 'CHANGE_INTERVAL';

const UPDATE_FILTERED_EVENTS = 'UPDATE_FILTERED_EVENTS';

const PROMOTED_EVENTS_LOADED = 'PROMOTED_EVENTS_LOADED';
const ARCHIVED_EVENTS_LOADED = 'ARCHIVED_EVENTS_LOADED';

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

function eventsLoaded( events, page = 0, pageSize = 10, queryTime, filter) {
    return {
        type: EVENTS_LOADED,
        events: events.features,
        total: events.count,
        page,
        pageSize,
        queryTime,
        filter
    };
}
function promotedEventsLoaded( events, page = 0, pageSize = 1000, filter) {
    return {
        type: PROMOTED_EVENTS_LOADED,
        events: events.features,
        total: events.count,
        page,
        pageSize,
        filter
    };
}
function archivedEventsLoaded( events, page = 0, pageSize = 1000, filter) {
    return {
        type: ARCHIVED_EVENTS_LOADED,
        events: events.features,
        total: events.count,
        page,
        pageSize,
        filter
    };
}


function eventsLoading(loading = true) {
    return {
        type: EVENTS_LOADING,
        loading
    };
}
function eventsLoadError(e) {
    return {
        type: EVENTS_LOAD_ERROR,
        error: e
    };
}
function loadEvents(url = '/decat/api/alerts', page = 0, pageSize = 10, filterParams) {
    return {
        type: LOAD_EVENTS,
        url,
        page,
        pageSize,
        filterParams
    };
}
function loadPromotedEvents(url = '/decat/api/alerts', page = 0, pageSize = 1000, filterParams) {
    return {
        type: LOAD_PROMOTED_EVENTS,
        url,
        page,
        pageSize,
        filterParams
    };
}
function loadArchivedEvents(url = '/decat/api/alerts', page = 0, pageSize = 1000, filterParams) {
    return {
        type: LOAD_ARCHIVED_EVENTS,
        url,
        page,
        pageSize,
        filterParams
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
    return {
        type: ADD_EVENT
    };
}

function editEvent(event) {
    return {
        type: EDIT_EVENT,
        event
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
    return {
        type: TOGGLE_DRAW
    };
}

function cancelEdit() {
    return {
        type: CANCEL_EDIT
    };
}

function eventSaved(data) {
    return {
        type: EVENT_CREATED,
        data
    };
}

function eventPromoted(data) {
    return {
        type: EVENT_PROMOTED,
        data
    };
}
function eventUpdated(data) {
    return {
        type: EVENT_UPDATED,
        data
    };
}
function eventArchived(data) {
    return {
        type: EVENT_ARCHIVED,
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

function saveEvent(mode, promote, archive = false, url = '/decat/api/alerts/') {
    return (dispatch, getState) => {
        dispatch(eventSaving(true));
        const currentEvent = getState().alerts.currentEvent || {};
        const alertInfo = mode === 'ADD' ? {
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
        } : {
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
                promoted: promote,
                archived: archive
            },
            geometry: {
                type: "Point",
                coordinates: [currentEvent.point && currentEvent.point.lat, currentEvent.point && currentEvent.point.lng]
            }
        };
        if (mode === 'ADD') {
            axios.post(url, alertInfo, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                dispatch(eventSaved(response.data));
                dispatch(cancelEdit());
            }).catch((e) => {
                dispatch(eventSaveError(e));
            });
        } else {
            axios.patch(url + currentEvent.id, alertInfo, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                switch (mode) {
                    case 'UPDATE':
                        dispatch(eventUpdated(response.data));
                        break;
                    case 'ARCHIVE':
                        dispatch(eventArchived(response.data));
                        break;
                    case 'PROMOTE':
                        dispatch(eventPromoted(response.data));
                        break;
                    default:
                        dispatch(eventUpdated(response.data));
                }
                dispatch(cancelEdit());
            }).catch((e) => {
                dispatch(eventSaveError(e));
            });
        }
    };
}

function toggleEventVisibility(event) {
    return {
        type: TOGGLE_EVENT,
        event
    };
}


function toggleEntityValue(entitiesId, entityIdx, checked) {
    return {
        type: TOGGLE_ENTITY_VALUE,
        entitiesId,
        entityIdx,
        checked
    };
}
function toggleEntities(entitiesId, checked) {
    return {
        type: TOGGLE_ENTITIES,
        entitiesId,
        checked
    };
}

function onSearchTextChange(text) {
    return {
        type: SEARCH_TEXT_CHANGE,
        text
    };
}
function resetAlertsTextSearch() {
    return {
        type: RESET_ALERTS_TEXT_SEARCH
    };
}
function changeInterval(interval) {
    return {
        type: CHANGE_INTERVAL,
        interval
    };
}
function updateEvents() {
    return {
        type: UPDATE_FILTERED_EVENTS
    };
}

module.exports = {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR, REGIONS_LOADING, EVENTS_LOADED, EVENTS_LOAD_ERROR, LOAD_REGIONS, RESET_REGIONS_SELECTION, SELECT_REGIONS, TOGGLE_ENTITY_VALUE, ADD_EVENT, CHANGE_EVENT_PROPERTY, TOGGLE_DRAW, CANCEL_EDIT, EVENT_CREATED, EVENT_SAVE_ERROR, EVENT_SAVING,
    TOGGLE_EVENT, EDIT_EVENT, SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH, CHANGE_INTERVAL, TOGGLE_ENTITIES, EVENTS_LOADING, UPDATE_FILTERED_EVENTS, LOAD_EVENTS, PROMOTED_EVENTS_LOADED, ARCHIVED_EVENTS_LOADED, EVENT_UPDATED, EVENT_ARCHIVED, EVENT_PROMOTED, LOAD_ARCHIVED_EVENTS, LOAD_PROMOTED_EVENTS, eventsLoading, eventsLoadError, eventsLoaded, promotedEventsLoaded, archivedEventsLoaded, loadHazards, loadLevels, loadRegions, loadSourceTypes, loadEvents, regionsLoaded, regionsLoadError, regionsLoading, selectRegions, resetRegionsSelection, toggleEntityValue, addEvent, changeEventProperty, toggleDraw, cancelEdit, onSearchTextChange, resetAlertsTextSearch, changeInterval, toggleEntities, updateEvents, saveEvent, toggleEventVisibility, editEvent, loadArchivedEvents, loadPromotedEvents};
