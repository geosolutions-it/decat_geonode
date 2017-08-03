/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {DATA_LOADED, DATA_LOAD_ERROR, REGIONS_LOADED, REGIONS_LOAD_ERROR, EVENTS_LOADED, EVENTS_LOAD_ERROR, REGIONS_LOADING, SELECT_REGIONS, RESET_REGIONS_SELECTION, TOGGLE_ENTITY_VALUE, ADD_EVENT, CHANGE_EVENT_PROPERTY, TOGGLE_DRAW, CANCEL_EDIT, SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH, CHANGE_INTERVAL,
TOGGLE_ENTITIES, EVENT_CREATED, EVENT_PROMOTED, EVENT_SAVE_ERROR, EVENT_SAVING, TOGGLE_EVENT, EDIT_EVENT, EVENTS_LOADING, PROMOTED_EVENTS_LOADED, ARCHIVED_EVENTS_LOADED, EVENT_UPDATED, EVENT_ARCHIVED} = require('../actions/alerts');
const {GEONODE_MAP_CONFIG_LOADED, GEONODE_MAP_UPDATED, SAVE_MAP_ERROR, UPDATING_GEONODE_MAP} = require('../actions/GeoNodeConfig');


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
    case EVENTS_LOADED: {
        return assign({}, state, {
            events: action.events.map((ev) => assign({}, ev, {
                geometry: assign({}, ev.geometry, {
                    coordinates: [ev.geometry.coordinates[1], ev.geometry.coordinates[0]]
                })
            })),
            eventsInfo: {
                page: action.page || 0,
                total: action.total || 0,
                pageSize: action.pageSize || 10,
                queryTime: action.queryTime,
                filter: action.filter
            }
        });
    }
    case PROMOTED_EVENTS_LOADED: {
        return assign({}, state, {
            promotedEvents: action.events.map((ev) => assign({}, ev, {
                geometry: assign({}, ev.geometry, {
                    coordinates: [ev.geometry.coordinates[1], ev.geometry.coordinates[0]]
                })
            })),
            promotedEventsInfo: {
               page: action.page || 0,
               total: action.total || 0,
               pageSize: action.pageSize || 1000,
               filter: action.filter
            }
        });
    }
    case ARCHIVED_EVENTS_LOADED: {
        return assign({}, state, {
            archivedEvents: action.events.map((ev) => assign({}, ev, {
                geometry: assign({}, ev.geometry, {
                    coordinates: [ev.geometry.coordinates[1], ev.geometry.coordinates[0]]
                })
            })),
            archivedEventsInfo: {
               page: action.page || 0,
               total: action.total || 0,
               pageSize: action.pageSize || 1000,
               filter: action.filter
            }
        });
    }
    case EVENTS_LOAD_ERROR:
        return assign({}, state, {
            eventsError: action.error
        });
    case EVENTS_LOADING:
        return assign({}, state, {eventsLoading: action.loading});
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
            regions: {},
            drawEnabled: true
        });
    case EDIT_EVENT:
        return assign({}, state,
        {
            mode: 'EDIT',
            currentEvent: AlertsUtils.getEvent(state, action.event),
            regionsLoading: false,
            regions: {},
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
            regions: {},
            drawEnabled: false,
            saveError: null,
            saving: false
        });
    case EVENT_SAVING:
        return assign({}, state, {
            saving: action.status
        });
    case EVENT_CREATED:
    case EVENT_PROMOTED:
    case EVENT_UPDATED:
    case EVENT_ARCHIVED:
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
    case TOGGLE_ENTITY_VALUE: {
        const entities = state[action.entitiesId].map((en, idx) => {
            return idx === action.entityIdx ? assign({}, en, {selected: action.checked}) : en;
        });
        return assign({}, state, {[action.entitiesId]: entities});
    }
    case TOGGLE_ENTITIES: {
        return assign({}, state, {[action.entitiesId]: state[action.entitiesId].map((en) => (assign({}, en, {selected: action.checked})))});
    }
    case SEARCH_TEXT_CHANGE:
        return assign({}, state, { searchInput: action.text});
    case RESET_ALERTS_TEXT_SEARCH:
        return assign({}, state, { searchInput: undefined});
    case CHANGE_INTERVAL:
        return assign({}, state, {currentInterval: action.interval});
    case GEONODE_MAP_CONFIG_LOADED:
        return assign({}, state, {geonodeMapConfig: {id: action.mapId, config: action.config}});
    case GEONODE_MAP_UPDATED:
        return assign({}, state, {geonodeMapConfig: {id: action.mapId, config: action.config, updating: false}});
    case UPDATING_GEONODE_MAP:
        return assign({}, state, {geonodeMapConfig: assign({}, state.geonodeMapConfig, {updating: true, error: undefined})});
    case SAVE_MAP_ERROR:
        return assign({}, state, {geonodeMapConfig: assign({}, state.geonodeMapConfig, { error: action.error, updating: false})});
    case 'DISPLAY_METADATA_EDIT':
        return assign({}, state, {geonodeMapConfig: assign({}, state.geonodeMapConfig, { error: undefined, updating: false})});
    case 'TOGGLE_CONTROL':
        return action.control === 'save' ? assign({}, state, {geonodeMapConfig: assign({}, state.geonodeMapConfig, { error: undefined, updating: false})}) : state;
    default:
        return state;
    }
}

module.exports = alerts;
