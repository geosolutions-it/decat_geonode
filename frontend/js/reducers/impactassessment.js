/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const {SHOW_HAZARD, TOGGLE_IMPACT_MODE, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING, ADD_ASSESSMENT, CANCEL_ADD_ASSESSMENT, ASSESSMENT_PROMOTED} = require('../actions/impactassessment');

function impactassessment(state = null, action) {
    switch (action.type) {
        case SHOW_HAZARD:
            return assign({}, state, {mode: 'HAZARD', currentHazard: action.hazard, assessments: [], assessmentsInfo: {}});
        case TOGGLE_IMPACT_MODE:
            return assign({}, state, {mode: action.mode});
        case ASSESSMENTS_LOADING:
            return assign({}, state, {assessmentsLoading: action.loading});
        case ASSESSMENTS_LOADING_ERROR:
            return assign({}, state, {assessmentsError: action.e});
        case ASSESSMENTS_LOADED: {
            return assign({}, state, {
                assessments: action.assessments,
                assessmentsInfo: {
                    page: action.page || 0,
                    total: action.total || 0,
                    pageSize: action.pageSize || 10
                }
            });
        }
        case ADD_ASSESSMENT:
            return assign({}, state, {newAssessment: {}, mode: 'NEW_ASSESSMENT'});
        case CANCEL_ADD_ASSESSMENT:
            return assign({}, state, {newAssessment: undefined, mode: 'HAZARDS'});
        case ASSESSMENT_PROMOTED:
            return assign({}, state, { assessments: state.assessments.map((ass) => ass.id === action.ass.id && assign({}, ass, {properties: assign({}, ass.properties, {promoted: true, promoted_at: action.ass.properties.promoted_at})}) || ass)});
        default: return state;
    }
}

module.exports = impactassessment;
