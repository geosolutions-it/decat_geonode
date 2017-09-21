/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');

const axios = require('../../MapStore2/web/client/libs/ajax');
const moment = require('moment');
const {head} = require('lodash');
const urlparser = require('url');

const {LOAD_REGIONS, ADD_EVENT, EDIT_EVENT, CANCEL_EDIT, CHANGE_EVENT_PROPERTY, CHANGE_INTERVAL,
    TOGGLE_EVENT, DATA_LOADED, EVENTS_LOADED, EVENT_CREATED, EVENT_PROMOTED, EVENT_UPDATED, EVENT_ARCHIVED, UPDATE_FILTERED_EVENTS, TOGGLE_ENTITY_VALUE, TOGGLE_ENTITIES,
    LOAD_EVENTS, SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH, TOGGLE_DRAW, SELECT_REGIONS, PROMOTED_EVENTS_LOADED, ARCHIVED_EVENTS_LOADED, LOAD_ARCHIVED_EVENTS, LOAD_PROMOTED_EVENTS, loadEvents, loadRegions, regionsLoading, regionsLoaded, eventsLoadError, eventsLoaded, promotedEventsLoaded, archivedEventsLoaded, eventsLoading, changeEventProperty, loadSourceTypes, loadHazards, loadLevels, loadArchivedEvents, loadPromotedEvents} = require('../actions/alerts');

const {USER_INFO_LOADED, USER_INFO_ERROR} = require("../actions/security");
const {CLICK_ON_MAP} = require('../../MapStore2/web/client/actions/map');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {changeLayerProperties} = require('../../MapStore2/web/client/actions/layers');

const {panTo} = require('../../MapStore2/web/client/actions/map');

const AlertsUtils = require('../utils/AlertsUtils');
const getFeature = (point) => {
    return {
        type: "Feature",
        id: "1",
        geometry: {
            type: "Point",
            coordinates: [point.lng, point.lat]
        },
        properties: {}
    };
};
const createFiler = (state, filterParams, promoted = false, archived = false, role = 'event-operator') => {
    const {hazards, levels, selectedRegions, searchInput, currentInterval} = filterParams || state.alerts || {};
    const queryInterval = currentInterval.value ? `${moment.utc().subtract(currentInterval.value, currentInterval.period).format("YYYY-MM-DD HH:mm:ss")}Z` : undefined;
    return AlertsUtils.createFilter(hazards, levels, selectedRegions, queryInterval, searchInput, promoted, archived, role);
};
module.exports = {
    fetchRegions: (action$, store) =>
        action$.ofType(LOAD_REGIONS)
        .debounceTime(250)
        .switchMap((action) => {
            const {regionsPageSize = 10, regions = {}} = (store.getState()).alerts || {};
            const url = action.nextPage ? `${regions.next}&page_size=${regionsPageSize}` : `${action.url}?name__startswith=${action.searchText || ''}&page_size=${regionsPageSize}`;
            return Rx.Observable.fromPromise(
                axios.get(url).then(response => response.data)
            ).map((res) => {
                return regionsLoaded(res, action.nextPage );
            })
        .startWith(regionsLoading(true))
        .catch( (e) => {
            return Rx.Observable.from([
                    eventsLoadError(e.message || e)
            ]);
        })
        .concat([regionsLoading(false)]);
        }),
    resetRegions: (action$) =>
        action$.ofType(ADD_EVENT, EDIT_EVENT, CANCEL_EDIT)
        .debounceTime(250)
        .switchMap(() => {
            return Rx.Observable.of(loadRegions());
        }),
    selectPointFiltredRegions: (action$, store) =>
        action$.ofType(CLICK_ON_MAP)
        .filter((action) => store.getState().alerts && store.getState().alerts.drawEnabled && action.point)
        .switchMap((action) => {
            const {lat, lng} = action.point.latlng;
            const url = `/decat/api/regions?point=${lng},${lat}`;
            return Rx.Observable.fromPromise(
                axios.get(url).then(response => response.data)
            ).map((res) => changeEventProperty('regions', res.results))
            .startWith(regionsLoading(true))
            .catch( (e) => Rx.Observable.of(eventsLoadError(e.message || e)))
            .concat([regionsLoading(false)]);
        }),
    resetPointOnMap: (action$) =>
        action$.ofType(ADD_EVENT, EDIT_EVENT, TOGGLE_DRAW)
            .switchMap(() => {
                return Rx.Observable.of({
                    type: CLICK_ON_MAP,
                    point: null
                });
            }),
    editPointOnMap: (action$, store) =>
        action$.ofType(CLICK_ON_MAP)
            .filter((action) => store.getState().alerts && store.getState().alerts.drawEnabled && action.point)
            .switchMap((action) => {
                const event = store.getState().alerts.currentEvent || {};
                return Rx.Observable.from([changeLayerProperties('editalert', {
                    features: [getFeature(action.point.latlng)],
                    style: {
                        html: {
                            className: "fa fa-3x map-icon map-icon-new icon-" + (event.hazard && event.hazard.icon || 'eq') + " d-text-" + (event.level && event.level.icon || 'warning'),
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        }
                    }
                }), changeEventProperty('point', action.point.latlng)]);
            }),
    changeStyleOfPointOnMap: (action$, store) =>
        action$.ofType(CHANGE_EVENT_PROPERTY)
            .filter((action) => action.property === 'hazard' || action.property === 'level')
            .switchMap(() => {
                const event = store.getState().alerts.currentEvent || {};
                if (event.point) {
                    return Rx.Observable.of(changeLayerProperties('editalert', {
                        style: {
                            html: {
                                className: "fa fa-3x map-icon map-icon-new icon-" + (event.hazard && event.hazard.icon || 'eq') + " d-text-" + (event.level && event.level.icon || 'warning'),
                                iconSize: [36, 36],
                                iconAnchor: [18, 18]
                            }
                        }
                    }));
                }
                return Rx.Observable.empty();
            }),
    selectedEventsOnMap: (action$, store) =>
        action$.ofType(TOGGLE_EVENT)
            .switchMap((action) => {
                const [x, y] = action.event.geometry.coordinates;
                const panToAction = action.event.visible && [] || [panTo({x, y, crs: 'EPSG:4326'})];
                return Rx.Observable.from([changeLayerProperties('selectedalerts', {
                    features: store.getState().alerts.selectedEvents,
                    style: {
                        html: (feature) => ({
                            className: "fa fa-3x map-icon map-icon-selected icon-" + AlertsUtils.getHazardIcon(store.getState().alerts.hazards, feature.properties.hazard_type) + " d-text-" + (feature.properties.level || 'warning'),
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }
                })].concat(panToAction));
            }),
    eventsOnMap: (action$, store) =>
        action$.ofType(EVENTS_LOADED, PROMOTED_EVENTS_LOADED, ARCHIVED_EVENTS_LOADED, 'READD_HAZARDS')
            .switchMap((action) => {
                const isAlerts = action.type === EVENTS_LOADED || action.type === 'READD_HAZARDS';
                const isPromoted = action.type === PROMOTED_EVENTS_LOADED;
                const features = isAlerts && store.getState().alerts.events || isPromoted && store.getState().alerts.promotedEvents || store.getState().alerts.archivedEvents;
                const className = isAlerts && ' ' || isPromoted && ' promoted' || ' archived';
                const layerId = isAlerts && 'alerts' || isPromoted && 'promoted_alerts' || 'archived_alerts';

                return Rx.Observable.from([changeLayerProperties(layerId, {
                    features: features,
                    style: {
                        html: (feature) => ({
                            className: "fa fa-3x map-icon icon-" + AlertsUtils.getHazardIcon(store.getState().alerts.hazards, feature.properties.hazard_type) + " d-text-" + (feature.properties.level || 'warning') + className,
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }
                })].concat( isAlerts && [changeLayerProperties('selectedalerts', {
                        features: (store.getState().alerts.selectedEvents || []).filter((s) => store.getState().alerts.events.filter(ev => ev.id === s.id).length !== 0)
                    }
                )] || []));
            }),
    endOfEdit: (action$) =>
        action$.ofType(CANCEL_EDIT, EVENT_CREATED, EVENT_UPDATED, EVENT_PROMOTED, EVENT_ARCHIVED)
        .switchMap(() => {
            return Rx.Observable.from([changeLayerProperties('editalert', {
                features: []
            }), loadEvents()]);
        }),
    editEvent: (action$, store) =>
        action$.ofType(EDIT_EVENT)
        .switchMap((action) => {
            const event = store.getState().alerts.currentEvent || {};
            return Rx.Observable.from([changeLayerProperties('alerts', {
                features: store.getState().alerts.events.filter((ev) => ev.id !== action.event.id)
            }), changeLayerProperties('editalert', {
                features: [getFeature(event.point)],
                style: {
                    html: {
                        className: "fa fa-3x map-icon map-icon-new icon-" + (event.hazard && event.hazard.icon || 'eq') + " d-text-" + (event.level && event.level.icon || 'warning'),
                        iconSize: [36, 36],
                        iconAnchor: [18, 18]
                    }
                }
            })]);
        }),
    initialLoadingChain: (action$) =>
        action$.ofType(USER_INFO_LOADED).
        switchMap(() => Rx.Observable.from([loadSourceTypes(), loadRegions(), loadHazards(), loadLevels()])),
    redirectToLogin: (action$) =>
        action$.ofType(USER_INFO_ERROR).
        map(() => {
            const u = urlparser.parse(window.location.href);
            window.location.href = `${u.protocol}//${u.host}/account/login`;
            return {type: 'REDIRECT_TO_LOGIN'};
        }),
    initialEventsLoad: (action$, store) =>
        action$.ofType(MAP_CONFIG_LOADED, DATA_LOADED)
            .filter((action) => action.type !== DATA_LOADED || action.entity === 'hazards' || action.entity === 'levels')
            .bufferCount(3).take(1)
            .switchMap(() => {
                const {currentRole} = (store.getState() || {}).security;
                return Rx.Observable.from([loadEvents()].concat( currentRole === 'event-operator' ? [loadPromotedEvents(), loadArchivedEvents()] : []));
            }),
    updateEvents: (action$) =>
        action$.ofType(CHANGE_INTERVAL, UPDATE_FILTERED_EVENTS)
        .debounceTime(250)
        .switchMap(() => {
            return Rx.Observable.from([loadEvents('/decat/api/alerts', 0, 10), loadArchivedEvents(), loadPromotedEvents()]);
        }),
    filterChange: (action$) =>
            action$.ofType(SELECT_REGIONS, SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH, TOGGLE_ENTITY_VALUE, TOGGLE_ENTITIES)
            .debounce((action) => {
                switch (action.type) {
                    case SEARCH_TEXT_CHANGE:
                    case RESET_ALERTS_TEXT_SEARCH:
                        return Rx.Observable.interval(250);
                    case SELECT_REGIONS:
                    case TOGGLE_ENTITY_VALUE:
                    case TOGGLE_ENTITIES:
                        return Rx.Observable.interval(500);
                    default:
                        return Rx.Observable.interval(250);
                }
            })
            .switchMap(() => {
                return Rx.Observable.from([loadEvents('/decat/api/alerts', 0, 10), loadArchivedEvents(), loadPromotedEvents()]);
            }),
    fetchEvents: (action$, store) =>
            action$.ofType(LOAD_EVENTS)
            .debounceTime(250)
            .filter(() => {
                const {currentRole} = (store.getState() || {}).security;
                return ['event-operator', 'impact-assessor', 'emergency-manager'].indexOf(currentRole) !== -1;
            })
            .switchMap((action) => {
                const queryTime = moment();
                const state = store.getState();
                const {security} = state || {};
                const filter = createFiler(state, action.filterParams, false, false, security.currentRole);
                const url = security.currentRole === 'emergency-manager' ? action.url.replace(/alerts/, 'cops') : action.url;
                return Rx.Observable.fromPromise(
                    axios.get(`${url}?page=${action.page + 1}&page_size=${action.pageSize}${filter}`).then(response => response.data))
                    .map((data) => {
                        return eventsLoaded(data, action.page, action.pageSize, queryTime, filter);
                    })
                    .startWith(eventsLoading(true))
                    .catch( (e) => {
                        return Rx.Observable.from([
                        eventsLoadError(e.message || e)
                    ]);
                    })
            .concat([eventsLoading(false)]);
            }),
    fetchPromotedEvents: (action$, store) =>
        action$.ofType(LOAD_PROMOTED_EVENTS, 'ADD_LAYER', EVENT_PROMOTED)
        .filter(() => {
            const {layers, security} = store.getState() || {};
            const hasPromoted = head(layers.flat.filter(l => l.id === "promoted_alerts"));
            return security.currentRole === 'event-operator' && hasPromoted;
        })
        .switchMap((action) => {
            const filter = createFiler(store.getState(), action.filterParams, true);
            const {page = 0, pageSize = 1000, url = '/decat/api/alerts'} = action;
            return Rx.Observable.fromPromise(
                axios.get(`${url}?page=${page + 1}&page_size=${pageSize}${filter}`).then(response => response.data))
                .map((data) => {
                    return promotedEventsLoaded(data, page, pageSize, filter);
                });
        }),
    fetchArchivedEvents: (action$, store) =>
        action$.ofType(LOAD_ARCHIVED_EVENTS, EVENT_ARCHIVED)
        .filter(() => {
            const {layers, security} = store.getState() || {};
            return security.currentRole === 'event-operator' && head(layers.flat.filter(l => l.id === "archived_alerts"));
        })
        .switchMap((action) => {
            const filter = createFiler(store.getState(), action.filterParams, false, true);
            const {page = 0, pageSize = 1000, url = '/decat/api/alerts'} = action;
            return Rx.Observable.fromPromise(
                axios.get(`${url}?page=${page + 1}&page_size=${pageSize}${filter}`).then(response => response.data))
                    .map((data) => {
                        return archivedEventsLoaded(data, page, pageSize, filter);
                    });
        })
};
