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

function loadModels(url = '/decat/api/hazard_models/', page = 0, pageSize = 1) {
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
function showHazard(hazard) {
    return {
        type: SHOW_HAZARD,
        hazard
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

module.exports = {
    SHOW_HAZARD, TOGGLE_IMPACT_MODE, LOAD_ASSESSMENTS, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING, ADD_ASSESSMENT,
    CANCEL_ADD_ASSESSMENT, SAVE_ASSESSMENT, PROMOTE_ASSESSMET, ASSESSMENT_PROMOTED, LOAD_MODELS, MODELS_LOADED, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS,
    toggleImpactMode, showHazard, loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading, addAssessment, cancelAddAssessment,
    saveAssessment, promoteAssessment, loadModels, modelsLoaded, toggleHazard, toggleHazards
};
