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
const urlparser = require('url');
const {LOAD_REGIONS, ADD_EVENT, PROMOTE_EVENT, CANCEL_EDIT, CHANGE_EVENT_PROPERTY, CHANGE_INTERVAL,
    TOGGLE_EVENT, DATA_LOADED, EVENTS_LOADED, EVENT_SAVED, EVENT_PROMOTED, UPDATE_FILTERED_EVENTS,
    LOAD_EVENTS, SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH, TOGGLE_DRAW,
    loadEvents, loadRegions, regionsLoading, regionsLoaded, eventsLoadError, eventsLoaded, eventsLoading, changeEventProperty, loadSourceTypes, loadHazards, loadLevels} = require('../actions/alerts');

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
        action$.ofType(ADD_EVENT, PROMOTE_EVENT, CANCEL_EDIT)
        .debounceTime(250)
        .switchMap(() => {
            return Rx.Observable.of(loadRegions());
        }),
    resetPointOnMap: (action$) =>
        action$.ofType(ADD_EVENT, PROMOTE_EVENT, TOGGLE_DRAW)
            .switchMap(() => {
                return Rx.Observable.of({
                    type: CLICK_ON_MAP,
                    clickPoint: null
                });
            }),
    editPointOnMap: (action$, store) =>
        action$.ofType(CLICK_ON_MAP)
            .filter(() => store.getState().alerts && store.getState().alerts.drawEnabled)
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
        action$.ofType(EVENTS_LOADED)
            .switchMap(() => {
                return Rx.Observable.from([changeLayerProperties('alerts', {
                    features: store.getState().alerts.events,
                    style: {
                        html: (feature) => ({
                            className: "fa fa-3x map-icon icon-" + AlertsUtils.getHazardIcon(store.getState().alerts.hazards, feature.properties.hazard_type) + " d-text-" + (feature.properties.level || 'warning'),
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }
                }), changeLayerProperties('selectedalerts', {
                        features: (store.getState().alerts.selectedEvents || []).filter((s) => store.getState().alerts.events.filter(ev => ev.id === s.id).length !== 0)
                    }
                )]);
            }),
    endOfEdit: (action$) =>
        action$.ofType(CANCEL_EDIT, EVENT_SAVED, EVENT_PROMOTED)
        .switchMap(() => {
            return Rx.Observable.from([changeLayerProperties('editalert', {
                features: []
            }), loadEvents()]);
        }),
    editEvent: (action$, store) =>
        action$.ofType(PROMOTE_EVENT)
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
    initialEventsLoad: (action$) =>
        action$.ofType(MAP_CONFIG_LOADED, DATA_LOADED)
            .filter((action) => action.type !== DATA_LOADED || action.entity === 'hazards' || action.entity === 'levels')
            .bufferCount(3)
            .map(() => {
                return loadEvents();
            }),
    updateEvents: (action$, store) =>
        action$.ofType(CHANGE_INTERVAL, UPDATE_FILTERED_EVENTS)
        .debounceTime(250)
        .map((action) => {
            const {hazards, levels, selectedRegions, searchInput, currentInterval} = (store.getState()).alerts || {};
            const int = action.type === CHANGE_INTERVAL ? action.interval : currentInterval;
            const filterParams = {hazards, levels, selectedRegions, searchInput, currentInterval: int};
            return loadEvents('/decat/api/alerts', 0, 10, filterParams);
        }),
    eventsTextSearch: (action$, store) =>
            action$.ofType(SEARCH_TEXT_CHANGE, RESET_ALERTS_TEXT_SEARCH)
            .debounceTime(250)
            .map((action) => {
                const {hazards, levels, selectedRegions, currentInterval} = (store.getState()).alerts || {};
                const searchInput = action.text;
                const filterParams = {hazards, levels, selectedRegions, searchInput, currentInterval};
                return loadEvents('/decat/api/alerts', 0, 10, filterParams);
            }),
    fetchEvents: (action$, store) =>
            action$.ofType(LOAD_EVENTS)
            .debounceTime(250)
            .switchMap((action) => {
                const {hazards, levels, selectedRegions, searchInput, currentInterval} = action.filterParams && action.filterParams || (store.getState()).alerts || {};
                const queryTime = moment();
                const queryInterval = currentInterval.value ? queryTime.clone().subtract(currentInterval.value, currentInterval.period).format("YYYY-MM-DD h:mm:ss") : undefined;
                const filter = AlertsUtils.createFilter(hazards, levels, selectedRegions, queryInterval, searchInput);
                return Rx.Observable.fromPromise(
                    axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}${filter}`).then(response => response.data)
                ).map((data) => {
                    return eventsLoaded(data, action.page, action.pageSize, queryTime);
                })
            .startWith(eventsLoading(true))
            .catch( (e) => {
                return Rx.Observable.from([
                        eventsLoadError(e.message || e)
                ]);
            })
            .concat([eventsLoading(false)]);
            })
};
