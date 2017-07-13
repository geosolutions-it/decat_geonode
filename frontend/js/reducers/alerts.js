/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR, EVENTS_LOADED, EVENTS_LOAD_ERROR, REGIONS_LOADING, SELECT_REGIONS, RESET_REGIONS_SELECTION,
    ADD_EVENT, CHANGE_EVENT_PROPERTY, TOGGLE_DRAW, CANCEL_EDIT, EVENT_SAVED, EVENT_PROMOTED, EVENT_SAVE_ERROR, EVENT_SAVING, TOGGLE_EVENT, PROMOTE_EVENT} = require('../actions/alerts');

const assign = require('object-assign');

const AlertsUtils = require('../utils/AlertsUtils');

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
        const regions = action.concatOptions ? assign({}, action.regions, {results: [...state.regions.results].concat(action.regions.results || []) }) : action.regions;
        return assign({}, state, {
            regions: regions
        });
    case REGIONS_LOAD_ERROR:
        return assign({}, state, {
            regionsError: action.error
        });
    case REGIONS_LOADING: {
        return assign({}, state, {
            regionsLoading: action.loading
        });
    }
    case EVENTS_LOADED:
        return assign({}, state, {
            events: action.events.map((ev) => assign({}, ev, {
                geometry: assign({}, ev.geometry, {
                    coordinates: [ev.geometry.coordinates[1], ev.geometry.coordinates[0]]
                })
            })),
            eventsInfo: {
                page: action.page || 0,
                total: action.total || 0
            }
        });
    case EVENTS_LOAD_ERROR:
        return assign({}, state, {
            eventsError: action.error
        });
    case SELECT_REGIONS:
        return assign({}, state, {
            selectedRegions: action.selectedRegions
        });
    case RESET_REGIONS_SELECTION:
        return assign({}, state, {
            selectedRegions: []
        });
    case ADD_EVENT:
        return assign({}, state,
        {
            mode: 'ADD',
            currentEvent: {},
            regionsLoading: false,
            regions: [],
            drawEnabled: true
        });
    case PROMOTE_EVENT:
        return assign({}, state,
        {
            mode: 'PROMOTE',
            currentEvent: AlertsUtils.getEvent(state, action.event),
            regionsLoading: false,
            regions: [],
            drawEnabled: false
        });
    case CHANGE_EVENT_PROPERTY:
        const newEvent = assign({}, state.currentEvent || {}, {
            [action.property]: action.value
        });
        return assign({}, state, {
            currentEvent: newEvent
        });
    case TOGGLE_DRAW:
        return assign({}, state, {
            drawEnabled: !state.drawEnabled
        });
    case CANCEL_EDIT:
        return assign({}, state,
        {
            mode: 'LIST',
            currentEvent: {},
            regionsLoading: false,
            regions: [],
            drawEnabled: false,
            saveError: null,
            saving: false
        });
    case EVENT_SAVING:
        return assign({}, state, {
            saving: action.status
        });
    case EVENT_SAVED:
        return assign({}, state, {
            saving: false,
            saveError: null
        });
    case EVENT_PROMOTED:
        return assign({}, state, {
            saving: false,
            saveError: null
        });
    case EVENT_SAVE_ERROR:
        return assign({}, state, {
            saveError: action.error,
            saving: false
        });
    case TOGGLE_EVENT:
        const currentlySelected = state.selectedEvents || [];
        return assign({}, state, {
            selectedEvents: currentlySelected.filter((ev) => ev.id !== action.event.id).length !== currentlySelected.length ?
                currentlySelected.filter((ev) => ev.id !== action.event.id) :
                currentlySelected.concat(action.event)
        });
    default:
        return state;
    }
}

module.exports = alerts;
