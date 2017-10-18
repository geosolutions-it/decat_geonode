/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

const EDIT_COP = 'EDIT_COP';
const LOAD_COP_ASSESSMENTS = 'LOAD_COP_ASSESSMENTS';
const SHOW_COP_HAZARD = 'SHOW_COP_HAZARD';
const NO_COP_ASSESSMENTS = 'NO_COP_ASSESSMENTS';
const INVALID_COP = 'INVALID_COP';
const CHECK_COP_VALIDITY = 'CHECK_COP_VALIDITY';
const CANCEL_ADD_ASSESSMENT_COP = 'CANCEL_ADD_ASSESSMENT_COP';

function editCop(mapId) {
    return {
        type: EDIT_COP,
        mapId
    };
}

function loadCopAssessments(url = '/decat/api/cops/{id}/assessments/', page = 0, pageSize = 5) {
    return {
        type: LOAD_COP_ASSESSMENTS,
        url,
        page,
        pageSize
    };
}

function showCopHazard(hazard) {
    return {
        type: SHOW_COP_HAZARD,
        hazard
    };
}

function noCopAssessments() {
    return {
        type: NO_COP_ASSESSMENTS
    };
}

function checkCopValidity(mapId, hazardId) {
    return {
        type: CHECK_COP_VALIDITY,
        mapId,
        hazardId
    };
}

function invalidCop() {
    return {
        type: INVALID_COP
    };
}

function cancelAddAssessmentCop() {
    return {
        type: CANCEL_ADD_ASSESSMENT_COP
    };
}

module.exports = {
    EDIT_COP, editCop,
    LOAD_COP_ASSESSMENTS, loadCopAssessments,
    SHOW_COP_HAZARD, showCopHazard,
    NO_COP_ASSESSMENTS, noCopAssessments,
    CHECK_COP_VALIDITY, checkCopValidity,
    INVALID_COP, invalidCop,
    CANCEL_ADD_ASSESSMENT_COP, cancelAddAssessmentCop
};
