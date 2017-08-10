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
function loadAssessments(url = '/api/maps/', page = 0, pageSize = 10) {
    return {
        type: LOAD_ASSESSMENTS,
        url,
        page,
        pageSize
    };
}
function assessmentsLoaded( assessments, count, page = 0, pageSize = 10) {
    return {
        type: ASSESSMENTS_LOADED,
        assessments,
        total: count,
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
    SHOW_HAZARD, TOGGLE_IMPACT_MODE, LOAD_ASSESSMENTS, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING, toggleImpactMode, showHazard, loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading
};
