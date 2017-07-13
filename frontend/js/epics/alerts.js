/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const axios = require('../../MapStore2/web/client/libs/ajax');
const {LOAD_REGIONS, ADD_EVENT, PROMOTE_EVENT, CANCEL_EDIT, CHANGE_EVENT_PROPERTY, TOGGLE_EVENT, EVENTS_LOADED, EVENT_SAVED, EVENT_PROMOTED,
    loadRegions, regionsLoading, regionsLoaded, eventsLoadError, changeEventProperty, loadEvents} = require('../actions/alerts');
const {CLICK_ON_MAP} = require('../../MapStore2/web/client/actions/map');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {changeLayerProperties} = require('../../MapStore2/web/client/actions/layers');

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
            .switchMap(() => {
                return Rx.Observable.of(changeLayerProperties('selectedalerts', {
                    features: store.getState().alerts.selectedEvents,
                    style: {
                        html: (feature) => ({
                            className: "fa fa-3x map-icon map-icon-selected icon-" + AlertsUtils.getHazardIcon(store.getState().alerts.hazards, feature.properties.hazard_type) + " d-text-" + (feature.properties.level || 'warning'),
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }
                }));
            }),
    eventsOnMap: (action$, store) =>
        action$.ofType(EVENTS_LOADED)
            .switchMap(() => {
                return Rx.Observable.of(changeLayerProperties('alerts', {
                    features: store.getState().alerts.events,
                    style: {
                        html: (feature) => ({
                            className: "fa fa-3x map-icon icon-" + AlertsUtils.getHazardIcon(store.getState().alerts.hazards, feature.properties.hazard_type) + " d-text-" + (feature.properties.level || 'warning'),
                            iconSize: [36, 36],
                            iconAnchor: [18, 18]
                        })
                    }
                }));
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
    initialEventsLoad: (action$) =>
        action$.ofType(MAP_CONFIG_LOADED)
        .switchMap(() => {
            return Rx.Observable.of(loadEvents());
        })
};
