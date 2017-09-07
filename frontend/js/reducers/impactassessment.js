/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');
const {head} = require('lodash');

const {SHOW_HAZARD, TOGGLE_IMPACT_MODE, ASSESSMENTS_LOADED, ASSESSMENTS_LOADING_ERROR, ASSESSMENTS_LOADING,
    ADD_ASSESSMENT, CANCEL_ADD_ASSESSMENT, ASSESSMENT_PROMOTED, MODELS_LOADED, TOGGLE_HAZARD_VALUE, TOGGLE_HAZARDS,
    SHOW_MODEL, RUNS_LOADED, TOGGLE_MODEL_MODE, FILES_UPLOADING, UPLOADING_ERROR, OUTPUT_UPDATED,
    UPDATE_PROPERTY, NEW_RUN_SAVE_ERROR, RUN_SAVING, ADD_REPORT, REMOVE_REPORT, RUN_UPDATED, RUN_DELETED,
BGRM_RUN_ERROR} = require('../actions/impactassessment');
const {DATA_LOADED} = require('../actions/alerts');
const {GEONODE_MAP_CONFIG_LOADED} = require('../actions/GeoNodeConfig');

function impactassessment(state = null, action) {
    switch (action.type) {
        case SHOW_HAZARD: {
            const {hazard_type: hazardType} = action.hazard && action.hazard.properties || {};
            const hazards = state.hazards.map((hazard) => hazard.name === hazardType ? assign({}, hazard, {selected: true}) : assign({}, hazard, {selected: false}));
            return assign({}, state, {mode: 'HAZARD', currentHazard: action.hazard, assessments: [], assessmentsInfo: {}, hazards});
        }
        case SHOW_MODEL: {
            return assign({}, state, {mode: 'MODEL', currentModel: action.model, runs: [], runsInfo: {}});
        }
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
                    pageSize: action.pageSize || 5
                }
            });
        }
        case ADD_ASSESSMENT:
            return assign({}, state, {newAssessment: {}, mode: 'NEW_ASSESSMENT'});
        case CANCEL_ADD_ASSESSMENT:
            return assign({}, state, {newAssessment: undefined, mode: 'HAZARDS'});
        case ASSESSMENT_PROMOTED:
            return assign({}, state, { assessments: state.assessments.map((ass) => ass.id === action.ass.id && assign({}, ass, {properties: assign({}, ass.properties, {promoted: true, promoted_at: action.ass.properties.promoted_at})}) || ass)});
        case MODELS_LOADED:
            return assign({}, state, {
                models: action.models,
                modelsInfo: {
                    page: action.page || 0,
                    total: action.total || 0,
                    pageSize: action.pageSize || 5,
                    filter: action.filter
                }
            });
        case RUNS_LOADED:
            return assign({}, state, {
                runs: action.runs,
                runsInfo: {
                    page: action.page || 0,
                    total: action.total || 0,
                    pageSize: action.pageSize || 5
                }
            });
        case RUN_UPDATED:
            return assign({}, state, {runs: state.runs.map(r => r.id === action.run.id && action.run || r)});
        case DATA_LOADED: {
            return action.entity === 'hazards' ? assign({}, state, {hazards: action.data}) : state;
        }
        case TOGGLE_HAZARD_VALUE: {
            const entities = state.hazards.map((en, idx) => {
                return idx === action.entityIdx ? assign({}, en, {selected: action.checked}) : en;
            });
            return assign({}, state, {hazards: entities});
        }
        case TOGGLE_HAZARDS: {
            return assign({}, state, {hazards: state.hazards.map((en) => (assign({}, en, {selected: action.checked})))});
        }
        case TOGGLE_MODEL_MODE: {
            return assign({}, state, {run: action.run, modelMode: action.mode, uploadingErrors: {}, uploading: false, saveRunError: undefined, runSaving: false});
        }
        case FILES_UPLOADING:
            return assign({}, state, {uploading: action.uploading});
        case UPLOADING_ERROR:
        return assign({}, state, {uploadingErrors: assign({}, state.uploadingErrors, {[action.output.output.id]: action.error})});
        case OUTPUT_UPDATED: {
            const outputs = state.run.properties.outputs.map(o => o.id === action.data.id && action.data || o);
            const run = assign({}, state.run, {properties: assign({}, state.run.properties, {outputs})});
            const runs = state.runs.map(r => r.id === run.id && run || r);
            return assign({}, state, {run, runs});
        }
        case UPDATE_PROPERTY: {
            const run = assign({}, state.run, {properties: assign({}, state.run.properties, {[action.property]: action.value})});
            return assign({}, state, {run});
        }
        case NEW_RUN_SAVE_ERROR:
            return assign({}, state, {saveRunError: action.error});
        case RUN_SAVING:
            return assign({}, state, {runSaving: action.saving});
        case ADD_REPORT:
            return assign({}, state, {documents: (state.documents || []).concat(action.report)});
        case REMOVE_REPORT:
            return assign({}, state, {documents: state.documents.filter(r => r.id !== action.id)});
        case GEONODE_MAP_CONFIG_LOADED: {
            const docLayer = head((action.config.map.layers || []).filter( l => l.documents));
            if (docLayer) {
                return assign({}, state, {documents: JSON.parse(docLayer.documents)});
            }
            return assign({}, state, {documents: undefined});
        }
        case BGRM_RUN_ERROR:
            return assign({}, state, {brgmError: action.error});
        default: return state;
        case RUN_DELETED:
            return assign({}, state, {runs: state.runs.filter(r => r.id !== action.runId)});
    }
}

module.exports = impactassessment;
