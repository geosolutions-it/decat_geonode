/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const SHOW_HAZARD = 'SHOW_HAZARD';
const TOGGLE_IMPACT_MODE = 'TOGGLE_IMPACT_MODE';
const LOAD_ASSESSMENTS = 'LOAD_ASSESSMENTS';
const ASSESSMENTS_LOADED = 'ASSESSMENTS_LOADED';
const ASSESSMENTS_LOADING_ERROR = 'ASSESSMENTS_LOADING_ERROR';
const ASSESSMENTS_LOADING = 'ASSESSMENTS_LOADING';
const ADD_ASSESSMENT = 'ADD_ASSESSMENT';
const CANCEL_ADD_ASSESSMENT = 'CANCEL_ADD_ASSESSMENT';
const SAVE_ASSESSMENT = 'SAVE_ASSESSMENT';
const PROMOTE_ASSESSMET = 'PROMOTE_ASSESSMENT';
const ASSESSMENT_PROMOTED = 'ASSESSMENT_PROMOTED';
const LOAD_MODELS = 'LOAD_MODELS';
const MODELS_LOADED = 'MODELS_LOADED';
const TOGGLE_HAZARD_VALUE = 'TOGGLE_HAZARD_VALUE';
const TOGGLE_HAZARDS = 'TOGGLE_HAZARDS';
const SHOW_MODEL = 'SHOW_MODEL';
const LOAD_RUNS = 'LOAD_RUNS';
const RUNS_LOADED = 'RUNS_LOADED';
const TOGGLE_MODEL_MODE = 'TOGGLE_MODEL_MODE';
const UPLOAD_FILES = 'UPLOAD_FILES';
const FILES_UPLOADING = 'FILES_UPLOADING';
const UPLOADING_ERROR = 'UPLOADING_ERROR ';
const OUTPUT_UPDATED = 'OUTPUT_UPDATED';
const UPDATE_PROPERTY = 'UPDATE_PROPERTY';
const SAVE_NEW_RUN = 'SAVE_NEW_RUN';
const NEW_RUN_SAVED = 'NEW_RUN_SAVED';
const NEW_RUN_SAVE_ERROR = 'NEW_RUN_SAVE_ERROR';
const RUN_SAVING = 'RUN_SAVING';
const ADD_RUN_LAYER_TO_MAP = 'ADD_RUN_LAYER_TO_MAP';
const ADD_REPORT = 'ADD_REPORT';
const REMOVE_REPORT = 'REMOVE_REPORT';
const RUN_BRGM = 'RUN_BRGM';
const RUN_UPDATED = 'RUN_UPDATED';
const BGRM_RUN_ERROR = 'BGRM_RUN_ERROR';
const DELETE_RUN = 'DELETE_RUN';
const RUN_DELETED = 'RUN_DELETED';
const DELETE_ASSESSMENT = 'DELETE_ASSESSMENT';
const DELETED_ASSESSMENT = 'DELETED_ASSESSMENT';
const DELETE_ASSESSMENT_ERROR = 'DELETE_ASSESSMENT_ERROR';
const HIDE_PERMALINK = 'HIDE_PERMALINK';

function deleteRun(runId) {
    return {
        type: DELETE_RUN,
        runId
    };
}

function bgrmError(error) {
    return {
        type: BGRM_RUN_ERROR,
        error
    };
}
function updateRun(run) {
    return {
        type: RUN_UPDATED,
        run
    };
}
function runBrgm(runId) {
    return {
        type: RUN_BRGM,
        runId
    };
}

function removeReport(id) {
    return {
        type: REMOVE_REPORT,
        id
    };
}

function addReport(report) {
    return {
        type: ADD_REPORT,
        report
    };
}

function addRunLayer(layer, run) {
    return {
        type: ADD_RUN_LAYER_TO_MAP,
        layer,
        run
    };
}

function runSaving(saving) {
    return {
        type: RUN_SAVING,
        saving
    };
}

function onSaveError(error) {
    return {
        type: NEW_RUN_SAVE_ERROR,
        error
    };
}

function saveRun(run) {
    return {
        type: SAVE_NEW_RUN,
        run
    };
}

function updateProperty(property, value) {
    return {
        type: UPDATE_PROPERTY,
        property,
        value
    };
}

function outputUpdated( data) {
    return {
        type: OUTPUT_UPDATED,
        data
    };
}
function uploadingError(error, output) {
    return {
            type: UPLOADING_ERROR,
            error,
            output
    };
}

function filesUploading(uploading) {
    return {
        type: FILES_UPLOADING,
        uploading
    };
}

function onUploadFiles(files) {
    return {
        type: UPLOAD_FILES,
        files
    };
}

function toggleModelMode(mode, run) {
    return {
        type: TOGGLE_MODEL_MODE,
        mode,
        run
    };
}

function runsLoaded( runs, page = 0, pageSize = 5) {
    return {
        type: RUNS_LOADED,
        runs: runs.features || [],
        total: runs.count,
        page,
        pageSize
    };
}

function loadRuns(url = '/decat/api/hazard_model_runs/', page = 0, pageSize = 5) {
    return {
        type: LOAD_RUNS,
        url,
        page,
        pageSize
    };
}

function toggleHazard(entityIdx, checked) {
    return {
        type: TOGGLE_HAZARD_VALUE,
        entityIdx,
        checked
    };
}
function toggleHazards(checked) {
    return {
        type: TOGGLE_HAZARDS,
        checked
    };
}

function modelsLoaded( models, page = 0, pageSize = 5, filter) {
    return {
        type: MODELS_LOADED,
        models: models.features || [],
        total: models.count,
        page,
        pageSize,
        filter
    };
}

function loadModels(url = '/decat/api/hazard_models/', page = 0, pageSize = 5) {
    return {
        type: LOAD_MODELS,
        url,
        page,
        pageSize
    };
}

function promoteAssessment(id) {
    return {
        type: PROMOTE_ASSESSMET,
        id
    };
}

function saveAssessment(about) {
    return {
        type: SAVE_ASSESSMENT,
        about
    };
}

function cancelAddAssessment() {
    return {
        type: CANCEL_ADD_ASSESSMENT
    };
}

function addAssessment(mapId) {
    return {
        type: ADD_ASSESSMENT,
        mapId
    };
}

function deleteAssessment(mapId, url = '/decat/api/impact_assessments/', page = 0, pageSize = 5) {
    return {
        type: DELETE_ASSESSMENT,
        mapId,
        url,
        page,
        pageSize
    };
}

function deletedAssessment(id) {
    return {
        type: DELETED_ASSESSMENT,
        id
    };
}

function deleteAssessmentError(error) {
    return {
        type: DELETE_ASSESSMENT_ERROR,
        error
    };
}

function showHazard(hazard) {
    return {
        type: SHOW_HAZARD,
        hazard
    };
}

function showModel(model) {
    return {
            type: SHOW_MODEL,
            model
    };
}

function toggleImpactMode(mode) {
    return {
        type: TOGGLE_IMPACT_MODE,
        mode
    };
}
function loadAssessments(url = '/decat/api/impact_assessments/', page = 0, pageSize = 5) {
    return {
        type: LOAD_ASSESSMENTS,
        url,
        page,
        pageSize
    };
}
function assessmentsLoaded( assessments, page = 0, pageSize = 5) {
    return {
        type: ASSESSMENTS_LOADED,
        assessments: assessments.features || [],
        total: assessments.count,
        page,
        pageSize
    };
}
function assessmentsLoadError(e) {
    return {
        type: ASSESSMENTS_LOADING_ERROR,
        e
    };
}
function assessmentsLoading(loading = true) {
    return {
        type: ASSESSMENTS_LOADING,
        loading
    };
}

function hidePermalink() {
    return {
        type: HIDE_PERMALINK
    };
}

module.exports = {
    SHOW_HAZARD, TOGGLE_IMPACT_MODE, LOAD_ASSESSMENTS, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING, ADD_ASSESSMENT,
    CANCEL_ADD_ASSESSMENT, SAVE_ASSESSMENT, PROMOTE_ASSESSMET, ASSESSMENT_PROMOTED, LOAD_MODELS, MODELS_LOADED, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS,
    SHOW_MODEL, RUNS_LOADED, LOAD_RUNS, TOGGLE_MODEL_MODE, UPLOAD_FILES, FILES_UPLOADING, UPLOADING_ERROR, OUTPUT_UPDATED, UPDATE_PROPERTY,
    SAVE_NEW_RUN, NEW_RUN_SAVED, NEW_RUN_SAVE_ERROR, RUN_SAVING, ADD_RUN_LAYER_TO_MAP, ADD_REPORT, REMOVE_REPORT, RUN_BRGM, RUN_UPDATED, BGRM_RUN_ERROR, DELETE_RUN, RUN_DELETED, DELETE_ASSESSMENT, DELETED_ASSESSMENT, DELETE_ASSESSMENT_ERROR,
    HIDE_PERMALINK,
    toggleImpactMode, showHazard, loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading, addAssessment, cancelAddAssessment,
    saveAssessment, promoteAssessment, loadModels, modelsLoaded, toggleHazard, toggleHazards, showModel, runsLoaded, loadRuns, toggleModelMode,
    onUploadFiles, filesUploading, uploadingError, outputUpdated, updateProperty, saveRun, onSaveError, runSaving, addRunLayer, addReport, removeReport, runBrgm, updateRun, bgrmError, deleteRun, deleteAssessment, deletedAssessment, deleteAssessmentError,
    hidePermalink
};
