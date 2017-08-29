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
const UploadUtils = require('../utils/UploadUtils');

const {configureMap, configureError} = require('../../MapStore2/web/client/actions/config');
const {removeNode} = require('../../MapStore2/web/client/actions/layers');
const {SHOW_HAZARD, LOAD_ASSESSMENTS, ADD_ASSESSMENT, SAVE_ASSESSMENT, PROMOTE_ASSESSMET, ASSESSMENT_PROMOTED, LOAD_MODELS, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS,
    SHOW_MODEL, LOAD_RUNS, UPLOAD_FILES, UPLOADING_ERROR, TOGGLE_MODEL_MODE, FILES_UPLOADING, SAVE_NEW_RUN, NEW_RUN_SAVED,
    loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading, modelsLoaded, loadModels, runsLoaded, loadRuns, filesUploading, uploadingError,
    outputUpdated, toggleModelMode, onSaveError, runSaving} = require('../actions/impactassessment');
const {loadEvents} = require('../actions/alerts');

const {head} = require('lodash');

module.exports = {
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
                    .map(data => assessmentsLoaded(data, action.page, action.pageSize))
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => Rx.Observable.of(assessmentsLoadError(e.message || e)))
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
    onModelsLoad: (action$) =>
        action$.ofType(ADD_ASSESSMENT, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS)
                .switchMap(() => Rx.Observable.of(loadModels())),
    fetchModels: (action$, store) =>
        action$.ofType(LOAD_MODELS)
            .switchMap((action) => {
                const {hazards = []} = (store.getState()).impactassessment || {};
                const filter = `hazard_type__in=${hazards.filter(h => h.selected).map(h => h.name).join(',')}`;
                return Rx.Observable.fromPromise(axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}&${filter}`).then(response => response.data))
                            .map(data => modelsLoaded(data, action.page, action.pageSize))
                            .startWith(assessmentsLoading(true))
                            .catch((e)=> Rx.Observable.of(assessmentsLoadError(e.message || e)))
                            .concat([assessmentsLoading(false)]);
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
            const {map, layers, alerts, impactassessment = {}} = store.getState() || {};
            const {documents = []} = impactassessment;
            const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, layers.flat, alerts.geonodeMapConfig, documents, action.about, 0);
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
        }),
    loadRuns: (action$) =>
        action$.ofType(SHOW_MODEL)
        .map(() => loadRuns()),
    fetchRuns: (action$, store) =>
            action$.ofType(LOAD_RUNS)
            .filter(() => {
                const {currentModel} = (store.getState()).impactassessment;
                return currentModel ? true : false;
            })
            .switchMap((action) => {
                const {impactassessment = {}, security = {}} = store.getState();
                const currentModel = impactassessment.currentModel;
                const {username} = security.user;
                const filter = '' || `model__id=${currentModel.id}&username=${username}`;
                return Rx.Observable.fromPromise(axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}&${filter}`).then(response => response.data))
                    .map(data => runsLoaded(data, action.page, action.pageSize))
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => Rx.Observable.of(assessmentsLoadError(e.message || e)))
                    .concat([assessmentsLoading(false)]);
            }),
     uploadFiles: (action$, store) =>
            action$.ofType(UPLOAD_FILES)
            .filter(act => Object.keys(act.files).length > 0)
            .switchMap((action) => {
                const {run = {}} = (store.getState()).impactassessment;
                const requests = Object.keys(action.files).map((key) => {
                    const file = action.files[key];
                    const output = head(run.properties.outputs.filter(o => o.id === parseInt(key, 10)));
                    const fileType = output.type === 'gn_layer' ? 'layer' : 'document';
                    return {fileType, output, formData: UploadUtils.getFormData(file, fileType), fileName: file.name};
                });
                return Rx.Observable.from(requests)
                        .map((o) => {
                            return Rx.Observable.fromPromise(axios.post(`/${o.fileType}s/upload`, o.formData).then(res => res).catch(res => res ))
                                    .map(res => {
                                        return res.status === 200 ? {type: 'FILE_UPLOADED', output: o, data: res.data} : uploadingError( res.data.errormsgs || res.statusText, o);
                                    });
                        })
                        .mergeAll()
                        .map(act => {
                            const {output, data} = act;
                            const {output: o, fileName} = output;
                            const {title, created_at: created} = run.properties;
                            if (act.type === UPLOADING_ERROR) {
                                return Rx.Observable.of(act);
                            }
                            const name = data.url.split('/').pop();

                            const post = {
                                data: name,
                                meta: JSON.stringify({"url": data.url, name: fileName, runTitle: title, runCreatedAt: created}),
                                uploaded: true
                            };
                            return Rx.Observable.fromPromise(axios.patch(`/decat/api/hazard_model_ios/${o.id}`, post).then(res => res).catch(res => res ))
                                    .map(res => {
                                        return res.status === 200 ? outputUpdated(res.data) : uploadingError( res.data.errormsgs || res.statusText, o);
                                    });
                        })
                        .mergeAll()
                        .startWith(filesUploading(true))
                        .takeUntil(action$.ofType( TOGGLE_MODEL_MODE))
                        .concat([filesUploading(false)]);
            }),
        closeUploadOnSuccess: (action$, store) =>
            action$.ofType(FILES_UPLOADING)
            .filter(a => !a.uploading)
            .filter(() => {
                const {uploadingErrors = {}} = (store.getState()).impactassessment;
                return Object.keys(uploadingErrors).length === 0;
            })
            .map(() => toggleModelMode('')),
        addRun: (action$) =>
            action$.ofType(SAVE_NEW_RUN)
            .switchMap(({run}) => {
                let newRun = assign({}, run, {properties: assign({}, run.properties, {title: run.properties.name})});
                return Rx.Observable.fromPromise(axios.post(`/decat/api/hazard_model_runs/`, newRun).then(res => res.data))
                        .map(data => {
                            return {type: NEW_RUN_SAVED, data};
                        }).
                        startWith(runSaving(true))
                        .catch( (e) => Rx.Observable.of(onSaveError(e.data || e)))
                        .concat([runSaving(false)]);
            }),
        afterRunCreated: (action$) =>
                action$.ofType(NEW_RUN_SAVED)
                .switchMap(() => Rx.Observable.from([loadRuns(), toggleModelMode('')]))
};
