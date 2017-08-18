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
const GeoNodeMapUtils = require('../utils/GeoNodeMapUtils');
const {configureMap, configureError} = require('../../MapStore2/web/client/actions/config');
const {removeNode} = require('../../MapStore2/web/client/actions/layers');
const {SHOW_HAZARD, LOAD_ASSESSMENTS, ADD_ASSESSMENT, SAVE_ASSESSMENT, PROMOTE_ASSESSMET, ASSESSMENT_PROMOTED, loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading} = require('../actions/impactassessment');
const {loadEvents} = require('../actions/alerts');

module.exports = {
    // No more used assesments are in event model
    loadAssessment: (action$) =>
        action$.ofType(SHOW_HAZARD)
        .map(() => loadAssessments()),
    fetchAssessments: (action$, store) =>
            action$.ofType(LOAD_ASSESSMENTS)
            .filter(() => {
                const {currentHazard} = (store.getState() || {}).impactassessment;
                return currentHazard ? true : false;
            })
            .switchMap((action) => {
                const {currentHazard} = (store.getState() || {}).impactassessment;
                const filter = '' || `hazard__id=${currentHazard.id}`;
                return Rx.Observable.fromPromise(axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}&${filter}`).then(response => response.data))
                    .map((data) => {
                        return assessmentsLoaded(data, action.page, action.pageSize);
                    })
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => {
                        return Rx.Observable.from([
                        assessmentsLoadError(e.message || e)
                    ]);
                    })
            .concat([assessmentsLoading(false)]);
            }),
    loadAssessmentBaseMap: (action$) =>
        action$.ofType(ADD_ASSESSMENT)
            .filter((a) => a.mapId)
            .switchMap((action) => {
                return Rx.Observable.fromPromise(axios.get(`/maps/${action.mapId}/data`).then(response => response.data))
                    .map(data => configureMap(data, action.mapId))
                    .catch((error)=> Rx.Observable.of(configureError(error)));
            }),
    removeDefaultLayers: (action$, store) =>
                action$.ofType(ADD_ASSESSMENT, 'MAP_CONFIG_LOADED').
                filter((a) => {
                    const {newAssessment} = (store.getState() || {}).impactassessment || {};
                    return newAssessment && (a.type === 'MAP_CONFIG_LOADED' || !a.mapId);
                })
                .switchMap(() => {
                    return Rx.Observable.of(removeNode("Hazards", "groups"));
                }),
    reloadHazards: (action$) =>
        action$.ofType('MAP_CONFIG_LOADED', 'CANCEL_ADD_ASSESSMENT').
        bufferCount(2)
        .switchMap(() => Rx.Observable.of(loadEvents())),
    saveAssessment: (action$, store) =>
        action$.ofType(SAVE_ASSESSMENT).
        switchMap((action) => {
            const {map, layers, alerts} = store.getState() || {};
            const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig, action.about, 0);
            return Rx.Observable.fromPromise(
                            axios.post("/maps/new/data", config).then(response => response.data)
                        ).map((res) => {
                            const {currentHazard} = (store.getState() || {}).impactassessment || {};
                            const geometry = assign({}, currentHazard.geometry, {
                                coordinates: [currentHazard.geometry.coordinates[1], currentHazard.geometry.coordinates[0]]
                            });
                            const param = {title: action.about.title, hazard: currentHazard.id, map: res.id, promoted: false, geometry};
                            return Rx.Observable.fromPromise(
                                    axios.post("/decat/api/impact_assessments/", param).then(response => response.data));

                        }).map(() => ({type: 'CANCEL_ADD_ASSESSMENT'})).startWith({type: 'UPDATING_GEONODE_MAP'})
                        .catch((error) => Rx.Observable.of({type: 'SAVE_MAP_ERROR', error}));

        }),
    promoteAssessment: (action$) =>
        action$.ofType(PROMOTE_ASSESSMET).
        switchMap(action => {
            const params = {promoted: true};
            return Rx.Observable.fromPromise(axios.patch(`/decat/api/impact_assessments/${action.id}`, params).then(response => response.data))
                    .map((data) => ({type: ASSESSMENT_PROMOTED, ass: data}))
                    .startWith(assessmentsLoading(true))
                    .catch((error) => Rx.Observable.of({type: 'PROMOTE_ASSESSMENT_ERROR', error}))
                    .concat([assessmentsLoading(false)]);
        })
};
