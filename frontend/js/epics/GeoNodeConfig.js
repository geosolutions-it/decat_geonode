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
const {loadMapConfig} = require('../../MapStore2/web/client/actions/config');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const {CREATE_GEONODE_MAP, GEONODE_MAP_CREATED, GEONODE_MAP_CONFIG_LOADED, UPDATE_GEONODE_MAP, GEONODE_MAP_UPDATED} = require('../actions/GeoNodeConfig');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const GeoNodeMapUtils = require('../utils/GeoNodeMapUtils');
const {USER_INFO_LOADED, USER_MAPS_INFO_UPDATED} = require("../actions/security");
module.exports = {
    loadGeonodeMapConfig: (action$, store) =>
        action$.ofType(USER_INFO_LOADED).
        switchMap((action) => {
            const {currentRole} = (store.getState() || {}).security;
            ConfigUtils.setConfigProp("decatCurrentRole", currentRole);
            const mapId = action.user.user && GeoNodeMapUtils.getDefaultMap(action.user.user.maps, action.user.user.roles) || ConfigUtils.getConfigProp('dectatDefaultMapId');
            return Rx.Observable.of(loadMapConfig(`/maps/${mapId}/data`, mapId));
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
                                axios.post("./maps/new/data", config).then(response => response.data)
                            ).map((res) => {
                                return {type: GEONODE_MAP_CREATED, res};
                            }).startWith({type: 'UPDATING_GEONODE_MAP'})
                            .catch((e) => Rx.Observable.of({type: 'CREATE_MAP_ERROR', e}));
            }),
    getGeoNodeMapConfig: (action$) =>
        action$.ofType(GEONODE_MAP_CREATED).
        switchMap((action) => {
            return Rx.Observable.fromPromise(
                        axios.get(`./maps/${action.res.id}/data`).then(response => response.data)
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
                                axios.put(`./maps/${alerts.geonodeMapConfig.id}/data`, config).then(response => response.data)
                            ).
                    map((res) => {
                        return {type: GEONODE_MAP_UPDATED, mapId: res.id, config: res};
                    }).
                    startWith(() => ({type: 'UPDATING_GEONODE_MAP'}))
                    .catch((e) => Rx.Observable.of({type: 'UPDATE_MAP_ERROR', e}));
            }),
    setUserMapforRole: (action$, store) =>
        action$.ofType(GEONODE_MAP_CREATED).
            switchMap((action) => {
                const {currentRole} = (store.getState() || {}).security;
                const param = {"maps": [{"role": currentRole, "map": action.res.id}]};
                return Rx.Observable.fromPromise(
                        axios.put("./decat/api/user/", param).then(response => response.data)).
                        map((user) => {
                            return {type: USER_MAPS_INFO_UPDATED, user};
                        });
            })
};
