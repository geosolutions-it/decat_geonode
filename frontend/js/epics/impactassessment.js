/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');

const moment = require('moment');
const {head} = require('lodash');

const axios = require('../../MapStore2/web/client/libs/ajax');
const assign = require('object-assign');
const GeoNodeMapUtils = require('../utils/GeoNodeMapUtils');
const UploadUtils = require('../utils/UploadUtils');

const {configureMap, configureError} = require('../../MapStore2/web/client/actions/config');
const {removeNode, addLayer, UPDATE_NODE} = require('../../MapStore2/web/client/actions/layers');
const {changeMapView} = require('../../MapStore2/web/client/actions/map');
const {SHOW_HAZARD, LOAD_ASSESSMENTS, ADD_ASSESSMENT, SAVE_ASSESSMENT, PROMOTE_ASSESSMET, ASSESSMENT_PROMOTED, ASSESSMENTS_LOADED, LOAD_MODELS, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS, DELETE_RUN, RUN_DELETED,
    SHOW_MODEL, LOAD_RUNS, UPLOAD_FILES, UPLOADING_ERROR, TOGGLE_MODEL_MODE, FILES_UPLOADING, SAVE_NEW_RUN, NEW_RUN_SAVED, RUN_BRGM, RUN_UPDATED, CANCEL_ADD_ASSESSMENT, DELETE_ASSESSMENT,
    loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading, modelsLoaded, loadModels, runsLoaded, loadRuns, filesUploading, uploadingError, addAssessment,
    outputUpdated, toggleModelMode, onSaveError, runSaving, updateRun, bgrmError, deleteAssessmentError, deletedAssessment,
    showHazard} = require('../actions/impactassessment');

const {USER_INFO_LOADED} = require("../actions/security");

const {EVENTS_LOADED, eventsLoaded} = require('../actions/alerts');

const {show} = require('../../MapStore2/web/client/actions/notifications');

const {LOAD_COP_ASSESSMENTS, SHOW_COP_HAZARD, NO_COP_ASSESSMENTS,
    CANCEL_ADD_ASSESSMENT_COP,
    loadCopAssessments, noCopAssessments, showCopHazard}
    = require('../actions/emergencymanager');
const {EDIT_COP, CHECK_COP_VALIDITY, INVALID_COP, checkCopValidity, invalidCop, editCop, cancelAddAssessmentCop} = require('../actions/emergencymanager');
const {toggleControl} = require('../../MapStore2/web/client/actions/controls');
const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const EventLayer = require('../ms2override/decatDefaultLayers').event;

const AlertsUtils = require('../utils/AlertsUtils');

function isWPSRunnnig(run) {
    return run.properties && run.properties.wps && run.properties.wps.execution && run.properties.wps.execution.completed === false;
}

const copValidationCheckRefreshTimeSelector = state => state && state.impactassessment && state.impactassessment.copValidationCheckRefreshTime || 60000;

const checkHazards = ({eventsInfo, events}, url = '/decat/api/alerts') => {
    const queryTime = moment().format();
    return Rx.Observable.fromPromise(
                axios.get(`${url}?page=${eventsInfo.page + 1}&page_size=${eventsInfo.pageSize}${eventsInfo.filter}`).then(response => response.data))
            .filter(data => {
                return (data.features || []).length !== (events || []).length || (data.features || []).filter((ft, idx) => ft.id !== (events[idx] || {}).id).length > 0;
            })
            .map((data) => {
                return Rx.Observable.of(show({
                                title: "impactassessor.checkhazards.title",
                                message: "impactassessor.checkhazards.message",
                                autoDismiss: 2
                            }, "info"), eventsLoaded(data, eventsInfo.page, eventsInfo.pageSize, queryTime, eventsInfo.filter));
            }).mergeAll()
            .catch( () => {
                return Rx.Observable.of(show({
                                title: "impactassessor.checkhazards.title",
                                message: "impactassessor.checkhazards.message",
                                autoDismiss: 2
                            }, "warning")
                );
            });
};
const checkAssessments = ({currentHazard = {}, assessmentsInfo, assessments}) => {
    const filter = `hazard__id=${currentHazard.id}`;
    return Rx.Observable.fromPromise(axios.get(`/decat/api/impact_assessments/?page=${assessmentsInfo.page + 1}&page_size=${assessmentsInfo.pageSize}&${filter}`).then(response => response.data))
        .filter(data => {
            return (data.features || []).length !== (assessments || []).length || (data.features || []).filter((ft, idx) => ft.id !== (assessments[idx] || {}).id).length > 0;
        })
        .map((data) => {
            return Rx.Observable.of(
                show({
                    title: "impactassessor.checkassessments.title",
                    message: "impactassessor.checkassessments.message",
                    autoDismiss: 2}, "info"), assessmentsLoaded(data, assessmentsInfo.page, assessmentsInfo.pageSize));
        })
        .mergeAll()
        .catch( () => {
            return Rx.Observable.of(show({
                title: "impactassessor.checkassessments.title",
                message: "impactassessor.checkassessments.errormessage",
                autoDismiss: 4
                }, "warning"));
        });
};

module.exports = {
    permalinkHazardStep1: (action$) =>
        action$.ofType(EVENTS_LOADED)
        .switchMap((action) => {
            if (ConfigUtils.getConfigProp('permalinkHazard')) {
                const hazard = head(action.events.filter(e => e.id === parseInt(ConfigUtils.getConfigProp('permalinkHazard'), 10)));
                if (hazard) {
                    ConfigUtils.setConfigProp('permalinkHazard', null);
                    if (ConfigUtils.getConfigProp('currentRole') === 'emergency-manager') {
                        return Rx.Observable.of(showCopHazard(hazard));
                    }
                    return Rx.Observable.of(showHazard(hazard));
                }
            }
            return Rx.Observable.empty();
        }),
    permalinkHazardStep2: (action$) =>
        action$.ofType(ASSESSMENTS_LOADED)
        .switchMap(() => {
            if (ConfigUtils.getConfigProp('permalinkMap')) {
                const cop = parseInt(ConfigUtils.getConfigProp('permalinkMap'), 10);
                ConfigUtils.setConfigProp('permalinkMap', null);
                if (ConfigUtils.getConfigProp('currentRole') === 'emergency-manager') {
                    return Rx.Observable.of(editCop(cop));
                }
                return Rx.Observable.of(addAssessment(cop));
            }
            return Rx.Observable.empty();
        }),
    permalinkHazardStep3: (action$) =>
        action$.ofType(UPDATE_NODE)
        .switchMap((action) => {
            if (action.node === 'annotations' && action.options && action.options.features && ConfigUtils.getConfigProp('permalinkAnnotation')) {
                const annotationId = ConfigUtils.getConfigProp('permalinkAnnotation');
                ConfigUtils.setConfigProp('permalinkAnnotation', null);
                const annotation = head(action.options.features.filter((f => f.id === parseInt(annotationId, 10) || f.properties.id === annotationId)));
                if (annotation) {
                    return Rx.Observable.of(changeMapView({
                        x: annotation.geometry.coordinates[0],
                        y: annotation.geometry.coordinates[1],
                        crs: "EPSG:4326"
                    }, 18)).delay(500);
                }
            }
            return Rx.Observable.empty();
        }),
    loadAssessment: (action$) =>
        action$.ofType(SHOW_HAZARD, CANCEL_ADD_ASSESSMENT)
        .map(() => loadAssessments()),
    loadCopAssessment: (action$) =>
        action$.ofType(SHOW_COP_HAZARD, CANCEL_ADD_ASSESSMENT_COP)
        .map(() => loadCopAssessments()),
    noCopAssessments: (action$) =>
        action$.ofType(NO_COP_ASSESSMENTS)
        .map(() => show({
            title: "emergencyManager.noassessments.title",
            message: "emergencyManager.noassessments.message",
            autoDismiss: 6
        }, "warning")),
    fetchCopAssessments: (action$, store) =>
            action$.ofType(LOAD_COP_ASSESSMENTS)
            .filter(() => {
                const {currentHazard} = (store.getState() || {}).impactassessment || {};
                return currentHazard ? true : false;
            })
            .switchMap((action) => {
                const {impactassessment= {}} = (store.getState() || {});
                const {currentHazard = {}} = impactassessment;
                const url = action.url.replace('{id}', currentHazard.id);
                return Rx.Observable.fromPromise(axios.get(`${url}?page=${action.page + 1}&page_size=${action.pageSize}`).then(response => response.data))
                    .map(data => data.id ? assessmentsLoaded({
                        features: [data],
                        count: 1
                    }, action.page, action.pageSize) : noCopAssessments())
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => Rx.Observable.of(assessmentsLoadError(e.message || e)))
                    .concat([assessmentsLoading(false)]);
            }),
    fetchAssessments: (action$, store) =>
            action$.ofType(LOAD_ASSESSMENTS)
            .filter(() => {
                const {currentHazard} = (store.getState() || {}).impactassessment || {};
                return currentHazard ? true : false;
            })
            .switchMap((action) => {
                const {currentHazard = {}} = (store.getState() || {}).impactassessment;
                const filter = `hazard__id=${currentHazard.id}`;
                return Rx.Observable.fromPromise(axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}&${filter}`).then(response => response.data))
                    .map(data => assessmentsLoaded(data, action.page, action.pageSize))
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => Rx.Observable.of(assessmentsLoadError(e.message || e)))
                    .concat([assessmentsLoading(false)]);
            }),
    loadAssessmentBaseMap: (action$) =>
        action$.ofType(ADD_ASSESSMENT, EDIT_COP)
            .filter((a) => a.mapId)
            .switchMap((action) => {
                return Rx.Observable.fromPromise(axios.get(`/maps/${action.mapId}/data`).then(response => response.data))
                    .map(data => configureMap(data, action.mapId))
                    .catch((error)=> Rx.Observable.of(configureError(error)));
            }),
    storeAndResetState: (action$, store) =>
        action$.ofType(ADD_ASSESSMENT, EDIT_COP).
        switchMap(() => {
            const {alerts, map, layers} = store.getState();
            let oldAlerts = alerts;
            const nMap = assign({}, map, {present: assign({}, map.present, {mapStateSource: 'decatRestore'})});
            return action$.ofType(EVENTS_LOADED, CANCEL_ADD_ASSESSMENT, CANCEL_ADD_ASSESSMENT_COP).
                filter(a => {
                    if (a.type === EVENTS_LOADED) {
                        const {alerts: newAlerts} = store.getState();
                        oldAlerts = {...oldAlerts, events: newAlerts.events, eventsInfo: newAlerts.eventsInfo};
                        return false;
                    }
                    return true;
                })
                .map(() => ({type: "RESTORE_DECAT", state: {alerts: oldAlerts, map: nMap, layers}}));
        }),
    scheduleCheckValidity: (action$, store) =>
        action$.ofType(EDIT_COP)
            .filter((a) => a.mapId)
            .switchMap((action) => {
                const currentHazard = store.getState().impactassessment && store.getState().impactassessment.currentHazard;
                return currentHazard && currentHazard.id ? Rx.Observable.of(checkCopValidity(action.mapId, currentHazard.id)).delay(copValidationCheckRefreshTimeSelector(store.getState())) : Rx.Observable.empty();
            }),
    checkValidity: (action$, store) =>
        action$.ofType(CHECK_COP_VALIDITY)
        .filter(a => store.getState().map.present.mapId === a.mapId)
        .switchMap((action) => {
            return Rx.Observable.fromPromise(axios.get(`/decat/api/cops/${action.hazardId}/assessments`).then(response => response.data))
                .map(data => data.properties && data.properties.map === action.mapId ? checkCopValidity(action.mapId, action.hazardId) : invalidCop(data.properties.map)).delay(copValidationCheckRefreshTimeSelector(store.getState()))
                .catch((error)=> Rx.Observable.of(configureError(error)));
        }),
    invalidCop: (action$) =>
        action$.ofType(INVALID_COP)
        .switchMap(action => {
            return Rx.Observable.of(show({
                title: "emergencyManager.invalidcop.title",
                message: "emergencyManager.invalidcop.message",
                autoDismiss: 4
            }, "error"), cancelAddAssessmentCop(), {type: "RESTORE_DECAT"}, editCop(action.id));
        }),
    // Add the current hazardous event to new created assessment map
    addHazardousEventTonewAssessment: (action$, store) =>
        action$.ofType(ADD_ASSESSMENT)
        .filter((a) => {
            const {currentHazard} = (store.getState()).impactassessment;
            return !a.mapId && !!currentHazard;
        })
        .switchMap(() => {
            const {impactassessment, alerts} = store.getState();
            const {currentHazard} = impactassessment;
            const html = {
                className: "fa fa-3x map-icon icon-" + AlertsUtils.getHazardIcon(alerts.hazards, currentHazard.properties.hazard_type) + " d-text-" + (currentHazard.properties.level || 'warning'),
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            };
            const layer = assign({}, EventLayer, {
                    features: [currentHazard],
                    style: {html}
                });
            return Rx.Observable.of(addLayer(layer));
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
    // reloadHazards: (action$) =>
    //     action$.ofType('CANCEL_ADD_ASSESSMENT')
    //     .switchMap(() => action$.ofType('MAP_CONFIG_LOADED')
    //             .map(() => ({type: 'READD_HAZARDS'}))
    //             .take(1)
    //     ),
    saveAssessment: (action$, store) =>
        action$.ofType(SAVE_ASSESSMENT).
        switchMap((action) => {
            const {map, layers, alerts, impactassessment = {}} = store.getState() || {};
            /* remove external annotations */
            const newLayers = assign({}, layers);
            const newFlat = newLayers.flat.map(layer => {
                if (layer.id === 'annotation') {
                    let newLayer = assign({}, layer);
                    newLayer.features = newLayer.features.filter(feature => !feature.match(/external_/));
                    return assign({}, newLayer);
                }
                return assign({}, layer);
            });
            const {documents = []} = impactassessment;
            const config = GeoNodeMapUtils.getGeoNodeMapConfig( map.present, newFlat, alerts.geonodeMapConfig, documents, action.about, 0);
            return Rx.Observable.fromPromise(
                            axios.post("/maps/new/data", config).then(response => response.data)
                        ).switchMap((res) => {
                            const {currentHazard} = (store.getState() || {}).impactassessment || {};
                            const geometry = assign({}, currentHazard.geometry, {
                                coordinates: [currentHazard.geometry.coordinates[1], currentHazard.geometry.coordinates[0]]
                            });
                            const param = {title: action.about.title, hazard: currentHazard.id, map: res.id, promoted: false, geometry};
                            return Rx.Observable.fromPromise(
                                    axios.post("/decat/api/impact_assessments/", param).then(response => response.data));
                        }).map(() => ({type: CANCEL_ADD_ASSESSMENT})).startWith({type: 'UPDATING_GEONODE_MAP'})
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
    deleteAssessment: action$ =>
        action$.ofType(DELETE_ASSESSMENT)
            .switchMap(action => {
                return Rx.Observable.fromPromise(axios.delete(`/decat/api/impact_assessments/${action.mapId}`).then(response => response.data))
                    .switchMap(() => Rx.Observable.of(deletedAssessment(action.mapId), loadAssessments(action.url, action.page, action.pageSize)))
                    .catch((error) => Rx.Observable.of(deleteAssessmentError(error)));
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
                const {currentModel, currentHazard} = impactassessment;
                const {username} = security.user;
                const filter = '' || `model__id=${currentModel.id}&username=${username}&hazard__id=${currentHazard.id}`;
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
                            if (act.type === UPLOADING_ERROR) {
                                return Rx.Observable.of(act);
                            }
                            let meta = {name: fileName, ...data};
                            const post = {
                                data: data.url,
                                meta: JSON.stringify(meta),
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
                .switchMap(() => Rx.Observable.from([loadRuns(), toggleModelMode('')])),
    launchBrgmProcess: (action$) =>
            action$.ofType(RUN_BRGM)
            .switchMap( a => {
                return Rx.Observable.fromPromise(axios.post(`/decat/api/model_run_start/${a.runId}/`).then(res => res.data))
                        .map(data => {
                            return {type: "PROCESS_RUNNIG", data, runId: a.runId};
                        })
                        .catch( (e) => {
                            const {failed, error} = e && e.data && e.data.error && e.data || {failed: e.status, error: e.statusText};
                            const ne = {title: failed, text: error};

                            return Rx.Observable.of(bgrmError(ne, a.runId));
                        } );
            }),
    checkBrgmProcess: (action$) =>
            action$.ofType('RUNS_LOADED')
            .filter(a => (a.runs || []).length > 0 && (a.runs || []).filter(isWPSRunnnig).length > 0)
            .switchMap((a) => {
                return Rx.Observable.from(a.runs.filter(isWPSRunnnig).map( run => ({type: "PROCESS_RUNNIG", runId: run.id })));
            }),
    updateRunProcess: (action$) =>
            action$.ofType("PROCESS_RUNNIG")
            .switchMap(a => {
                return Rx.Observable.timer(0, 5000)
                    .map(() => {
                        return Rx.Observable.defer(() => Rx.Observable.fromPromise(axios.get(`/decat/api/hazard_model_runs/${a.runId}`)))
                        .retryWhen(errors => errors.delay(1000).scan((count, err) => {
                            if ( count >= 2) {
                                throw err;
                            }
                            return count + 1;
                        }, 0));
                    })
                    .mergeAll().
                    filter((res) => res)
                    .map( res => {
                        return updateRun(res.data);
                    })
                    .takeUntil(action$.ofType(RUN_UPDATED).filter(act => act.run.properties.wps.execution.completed))
                    .takeUntil(action$.ofType(CANCEL_ADD_ASSESSMENT, CANCEL_ADD_ASSESSMENT_COP, LOAD_RUNS)).
                    takeUntil(action$.ofType("TOGGLE_IMPACT_MODE").filter( ac => ac.mode === 'NEW_ASSESSMENT'))
                    .catch( (e) => Rx.Observable.of({type: "UPDATE_BRGM_ERROR", error: e}));
            }),
    delRun: (action$) =>
        action$.ofType(DELETE_RUN)
            .switchMap((action) => {
                return Rx.Observable.fromPromise(
                    axios.delete(`/decat/api/hazard_model_runs/${action.runId}/`))
                .map(() => ({type: RUN_DELETED, runId: action.runId}))
                .catch((e) => Rx.Observable.of({type: "DELETE_RUN_ERROR", error: e}));
            }),
    closeAnnotationPanelOnSave: (action$, store) =>
        action$.ofType(CANCEL_ADD_ASSESSMENT, CANCEL_ADD_ASSESSMENT_COP).
        filter(() => {
            const {annotations} = store.getState().controls;
            return annotations && annotations.enabled;
        }).
        switchMap(() => Rx.Observable.of(toggleControl("annotations"))),
    refreshHazardsAssessments: (action$, store) =>
    action$.ofType(USER_INFO_LOADED, EVENTS_LOADED).bufferCount(2)
    .filter(() => {
        const {currentRole} = (store.getState() || {}).security;
        return currentRole === 'impact-assessor' || currentRole === 'emergency-manager';
    })
    .switchMap(() => {
        const {currentRole: role} = (store.getState() || {}).security;
        const refreshAlerts = Rx.Observable.timer(5000, 10000)
                .switchMap(() => {
                    const {alerts} = store.getState() || {};
                    return checkHazards(alerts, role === 'emergency-manager' && '/decat/api/cops' || '/decat/api/alerts');
                });
        const refreshAssessments = Rx.Observable.timer(10000, 10000)
            .filter(() => {
                const {mode} = (store.getState() || {}).impactassessment;
                return mode && mode !== 'HAZARDS' && role === 'impact-assessor';
            })
            .switchMap(() => {
                const {impactassessment = {}} = store.getState();
                return checkAssessments(impactassessment) || Rx.Observable.empty;
            });
        return refreshAlerts.merge(refreshAssessments);
    })
};
