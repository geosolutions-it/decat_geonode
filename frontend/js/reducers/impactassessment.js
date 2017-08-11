/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const {SHOW_HAZARD, TOGGLE_IMPACT_MODE, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING} = require('../actions/impactassessment');

function impactassessment(state = null, action) {
    switch (action.type) {
        case SHOW_HAZARD:
            return assign({}, state, {mode: 'HAZARD', currentHazard: action.hazard});
        case TOGGLE_IMPACT_MODE:
            return assign({}, state, {mode: action.mode, assessments: [], assessmentsInfo: {}});
        case ASSESSMENTS_LOADING:
            return assign({}, state, {assessmentsLoading: action.loading});
        case ASSESSMENTS_LOADING_ERROR:
            return assign({}, state, {assessmentsError: action.e});
        case ASSESSMENTS_LOADED: {
            return assign({}, state, {
                assessments: Object.keys(action.assessments).map(as => action.assessments[as]),
                assessmentsInfo: {
                    page: action.page || 0,
                    total: action.total || 0,
                    pageSize: action.pageSize || 10
                }
            });
        }
        default: return state;
    }

}

module.exports = impactassessment;
