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
const {CREATE_GEONODE_MAP, GEONODE_MAP_CREATED, GEONODE_MAP_CONFIG_LOADED, UPDATE_GEONODE_MAP, GEONODE_MAP_UPDATED, UPDATING_GEONODE_MAP, SAVE_MAP_ERROR} = require('../actions/GeoNodeConfig');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {zoomToExtent} = require("../../MapStore2/web/client/actions/map");
const GeoNodeMapUtils = require('../utils/GeoNodeMapUtils');
const CSWUtils = require('../utils/CSWUtils');

const {USER_INFO_LOADED, USER_MAPS_INFO_UPDATED} = require("../actions/security");
const {addLayer, removeLayer} = require("../../MapStore2/web/client/actions/layers");
const eventOperatorLayers = require("../ms2override/decatDefaultLayers");
const {head} = require('lodash');
const union = require('turf-union');
const bbox = require('turf-bbox');
const bboxPolygon = require('turf-bbox-polygon');
module.exports = {
    loadGeonodeMapConfig: (action$, store) =>
        action$.ofType('USER_REGIONS_BBOX')
        .switchMap(() => {
            const {currentRole, user} = (store.getState() || {}).security;
            ConfigUtils.setConfigProp("currentRole", currentRole);
            const mapId = user && GeoNodeMapUtils.getDefaultMap(user.maps, user.roles) || ConfigUtils.getConfigProp('defaultMapId');
            return Rx.Observable.fromPromise(axios.get(`/maps/${mapId}/data`).then(response => response.data))
                .map(data => configureMap(data, mapId))
                .catch((e)=> Rx.Observable.of(configureError(e)));
        }),
    centerDefaultMap: (action$, store) =>
        action$.ofType(MAP_CONFIG_LOADED, 'CHANGE_MAP_VIEW')
        .bufferCount(2)
        .take(1).
        filter((res) => {
            const {user} = (store.getState() || {}).security;
            const mapConfig = head(res.filter((r) => r.type === MAP_CONFIG_LOADED));
            const {defualtMapId} = (store.getState() || {}).security;
            return mapConfig.mapId === defualtMapId && user.regionsBBox && user.regionsBBox.length > 0;
        })
        .switchMap(() => {
            const {user} = (store.getState() || {}).security;
            const extent = bbox(user.regionsBBox.reduce((poly, regionBbox) => {
                return union(poly, bboxPolygon(regionBbox));
            }, bboxPolygon(user.regionsBBox[0])));
            return Rx.Observable.of(zoomToExtent(extent, "EPSG:4326"));
        }),
    storeGeonodMapConfig: (action$) =>
        action$.ofType(MAP_CONFIG_LOADED).
            switchMap((action) => {
                return Rx.Observable.of(assign({}, action, {type: GEONODE_MAP_CONFIG_LOADED}));
            }),
    createGeoNodeMap: (action$, store) =>
        action$.ofType(CREATE_GEONODE_MAP).
            switchMap((action) => {
                const {map, layers, alerts} = store.getState() || {};
                const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig, action.about, 0);
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
                const {map, layers, alerts} = store.getState() || {};
                const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig);
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
        })
};
