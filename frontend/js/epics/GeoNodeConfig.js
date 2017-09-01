/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const Rx = require('rxjs');
const axios = require('../../MapStore2/web/client/libs/ajax');
const assign = require('object-assign');
const {configureMap, configureError} = require('../../MapStore2/web/client/actions/config');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const {CREATE_GEONODE_MAP, GEONODE_MAP_CREATED, GEONODE_MAP_CONFIG_LOADED, UPDATE_GEONODE_MAP, GEONODE_MAP_UPDATED, UPDATING_GEONODE_MAP, SAVE_MAP_ERROR, setMinZoom} = require('../actions/GeoNodeConfig');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {panTo} = require("../../MapStore2/web/client/actions/map");
const GeoNodeMapUtils = require('../utils/GeoNodeMapUtils');

const CSWUtils = require('../utils/CSWUtils');

const {USER_INFO_LOADED, USER_MAPS_INFO_UPDATED} = require("../actions/security");
const {ADD_RUN_LAYER_TO_MAP} = require('../actions/impactassessment');
const {addLayer, removeLayer} = require("../../MapStore2/web/client/actions/layers");
const {["event-operator"]: eventOperatorLayers} = require("../ms2override/decatDefaultLayers");
const {head} = require('lodash');
const union = require('turf-union');
const bbox = require('turf-bbox');
const bboxPolygon = require('turf-bbox-polygon');
module.exports = {
    loadGeonodeMapConfig: (action$, store) =>
        action$.ofType('USER_REGIONS_BBOX', 'CANCEL_ADD_ASSESSMENT')
        .switchMap(() => {
            const {currentRole, user} = (store.getState() || {}).security;
            ConfigUtils.setConfigProp("currentRole", currentRole);
            const mapId = user && GeoNodeMapUtils.getDefaultMap(user.maps, user.roles) || ConfigUtils.getConfigProp('defaultMapId');
            return Rx.Observable.fromPromise(axios.get(`/maps/${mapId}/data`).then(response => response.data))
                .map(data => configureMap(data, mapId))
                .catch((error)=> {
                    if (error.status === 404) {
                        const {configUrl} = ConfigUtils.getConfigurationOptions({config: '/static/decat/config'});
                        return Rx.Observable.fromPromise(axios.get(configUrl).then(response => response.data))
                            .map(data => configureMap(data)).catch((e)=> Rx.Observable.of(configureError(e)));
                    }
                    return Rx.Observable.of(configureError(error));
                }
              );
        }),
    storeGeonodMapConfig: (action$) =>
        action$.ofType(MAP_CONFIG_LOADED).
            filter(action => action.legacy).
            switchMap((action) => {
                return Rx.Observable.of(assign({}, action, {type: GEONODE_MAP_CONFIG_LOADED}));
            }),
    createGeoNodeMap: (action$, store) =>
        action$.ofType(CREATE_GEONODE_MAP).
            switchMap((action) => {
                const {map, layers, alerts, impactassessment = {}} = store.getState() || {};
                const {documents = []} = impactassessment;
                const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig, documents, action.about, 0);
                return Rx.Observable.fromPromise(
                                axios.post("/maps/new/data", config).then(response => response.data)
                            ).map((res) => {
                                return {type: GEONODE_MAP_CREATED, res};
                            }).startWith({type: UPDATING_GEONODE_MAP})
                            .catch((error) => Rx.Observable.of({type: SAVE_MAP_ERROR, error}));
            }),
    getGeoNodeMapConfig: (action$) =>
        action$.ofType(GEONODE_MAP_CREATED).
        switchMap((action) => {
            return Rx.Observable.fromPromise(
                        axios.get(`/maps/${action.res.id}/data`).then(response => response.data)
                    ).map((res) => {
                        return {type: GEONODE_MAP_UPDATED, res};
                    });
        }),
    updateGeoNodeMap: (action$, store) =>
        action$.ofType(UPDATE_GEONODE_MAP).
            switchMap(() => {
                const {map, layers, alerts, impactassessment = {}} = store.getState() || {};
                const {documents} = impactassessment;
                const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig, documents);
                return Rx.Observable.fromPromise(
                                axios.put(`/maps/${alerts.geonodeMapConfig.id}/data`, config).then(response => response.data)
                            ).map((res) => {
                                return {type: GEONODE_MAP_UPDATED, mapId: res.id, config: res};
                            }).startWith({type: UPDATING_GEONODE_MAP})
                            .catch((e) => Rx.Observable.of({type: SAVE_MAP_ERROR, error: {status: e.status, statusText: e.statusText}}));
            }),
    setUserMapforRole: (action$, store) =>
        action$.ofType(GEONODE_MAP_CREATED).
            switchMap((action) => {
                const {currentRole} = (store.getState() || {}).security;
                const param = {"maps": [{"role": currentRole, "map": action.res.id}]};
                return Rx.Observable.fromPromise(
                        axios.put("/decat/api/user/", param).then(response => response.data)).
                        map((user) => {
                            return {type: USER_MAPS_INFO_UPDATED, user};
                        });
            }),
    fetchRegionsBBOX: (action$) =>
        action$.ofType(USER_INFO_LOADED)
        .switchMap((action) => {
            if (!CSWUtils.hasDataScopeRegions(action)) {
                return Rx.Observable.of({type: "USER_REGIONS_BBOX"});
            }
            const {user} = action;
            const regions = CSWUtils.getUserRegions(user);
            return Rx.Observable.fromPromise(
                    axios.get(`/decat/api/regions?code__in=${regions.join()}`).then(response => response.data
            ))
            .map(res => {
                const fetchedRegs = res.results;
                const cleanedReagions = regions.reduce((regs, reg) => regs.concat(fetchedRegs.filter((r) => reg === r.code)), []);
                const regionsBBox = CSWUtils.getRegionsBBox(cleanedReagions);
                ConfigUtils.setConfigProp('userBBOXFilter', regionsBBox);
                return {type: "USER_REGIONS_BBOX", regionsBBox};
            });
        }),
    addRemovePromoted: (action$, store) =>
        action$.ofType('CHANGE_MAP_VIEW')
        .filter( () => {
            const {currentRole} = (store.getState() || {}).security;
            return currentRole === 'event-operator';
        })
        .filter(() => {
            const {map, layers} = store.getState() || {};
            const minZoom = ConfigUtils.getConfigProp("promotedLayerMinZoom");
            const hasPromoted = head(layers.flat.filter(l => l.id === "promoted_alerts"));
            return map.present.zoom >= minZoom && !hasPromoted || map.present.zoom < minZoom && hasPromoted;
        })
        .switchMap(() => {
            const {map} = store.getState() || {};
            const promotedLayer = head(eventOperatorLayers.filter(l => l.id === 'promoted_alerts'));
            const minZoom = ConfigUtils.getConfigProp("promotedLayerMinZoom");
            const newAction = map.present.zoom < minZoom && removeLayer('promoted_alerts') || addLayer(promotedLayer, false);
            return Rx.Observable.of(newAction);
        }),
        centerDefaultMap: (action$, store) =>
            action$.ofType('CHANGE_MAP_VIEW')
            .take(1)
            .filter(() => {
                const {user} = (store.getState() || {}).security;
                return user.regionsBBox && user.regionsBBox.length > 0;
            })
            .switchMap(() => {
                const {map, security} = store.getState() || {};
                const {regionsBBox = []} = (security || {}).user;
                let {zoom, size, projection, viewerOptions, center} = (map || {}).present;
                const extent = bbox(regionsBBox.reduce((poly, regionBbox) => {
                    return union(poly, bboxPolygon(regionBbox));
                }, bboxPolygon(regionsBBox[0])));
                const newMapView = GeoNodeMapUtils.getCenterAndZoomForExtent(extent, size, map.present.bbox, "EPSG:4326", projection, -1) || {};
                if (zoom < newMapView.zoom) {
                    return Rx.Observable.from([{ type: 'CHANGE_MAP_VIEW', ...newMapView, size, mapStateSource: 'decat', viewerOptions, projection}, setMinZoom(newMapView.zoom)]);
                }
                const newCenter = GeoNodeMapUtils.limitCenter(extent, center, size, projection);
                if (newCenter && !GeoNodeMapUtils.isNearlyEqualPoint(newCenter, center)) {
                    return Rx.Observable.of(panTo(newCenter));
                }
                return Rx.Observable.from([{type: null}]);
            }),
    checkMapBbox: (action$, store) =>
        action$.ofType('CHANGE_MAP_VIEW').
        filter((action) => {
            const {user} = (store.getState() || {}).security;
            return user.regionsBBox && user.regionsBBox.length > 0 && action.mapStateSource === 'map';
        })
        .skip(2)// needed to fix leaflet this.map.getBoundsZoom([[repojectedPointA.y, repojectedPointA.x], [repojectedPointB.y, repojectedPointB.x]]) - 1;
        .switchMap(() => {
            const {map, security} = store.getState() || {};
            const {regionsBBox = []} = (security || {}).user;
            let {zoom, size, projection, viewerOptions, center} = (map || {}).present;
            const extent = bbox(regionsBBox.reduce((poly, regionBbox) => {
                return union(poly, bboxPolygon(regionBbox));
            }, bboxPolygon(regionsBBox[0])));
            const newMapView = GeoNodeMapUtils.getCenterAndZoomForExtent(extent, size, map.present.bbox, "EPSG:4326", projection, 1) || {};
            if (zoom < newMapView.zoom) {
                return Rx.Observable.from([{ type: 'CHANGE_MAP_VIEW', ...newMapView, size, mapStateSource: 'decat', viewerOptions, projection}, setMinZoom(newMapView.zoom)]);
            }
            const newCenter = GeoNodeMapUtils.limitCenter(extent, center, size, projection);
            if (newCenter && !GeoNodeMapUtils.isNearlyEqualPoint(newCenter, center)) {
                return Rx.Observable.of(panTo(newCenter));
            }
            return Rx.Observable.from([{type: null}]);
        }),
    addRunLayer: (action$) =>
                action$.ofType(ADD_RUN_LAYER_TO_MAP)
                .switchMap((a) => {
                    return Rx.Observable.of(addLayer(GeoNodeMapUtils.convertRunLayer(a.layer, a.run), false))
                        .catch((e) => Rx.Observable.of({type: '_ERROR', error: e}));
                })
};
