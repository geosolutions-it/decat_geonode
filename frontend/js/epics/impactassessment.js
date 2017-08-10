/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');

const axios = require('../../MapStore2/web/client/libs/ajax');
const {SHOW_HAZARD, LOAD_ASSESSMENTS, loadAssessments, assessmentsLoaded, assessmentsLoadError, assessmentsLoading} = require('../actions/impactassessment');

module.exports = {
    loadAssessment: (action$) =>
        action$.ofType(SHOW_HAZARD)
        .map(() => loadAssessments()),
    fetchAssessments: (action$, store) =>
            action$.ofType(LOAD_ASSESSMENTS)
            .debounceTime(250)
            .filter(() => {
                const {currentHazard} = (store.getState() || {}).impactassessment;
                return currentHazard ? true : false;
            })
            .switchMap((action) => {
                const {currentHazard} = (store.getState() || {}).impactassessment;
                const filter = '' || `hazard_id=${currentHazard.id}`;
                return Rx.Observable.fromPromise(
                    axios.get(`${action.url}?page=${action.page + 1}&page_size=${action.pageSize}${filter}`).then(response => response.data))
                    .map((data) => {
                        return assessmentsLoaded(data.objects, data.meta.total_count, action.page, data.meta.total_count ); // action.pageSize);
                    })
                    .startWith(assessmentsLoading(true))
                    .catch( (e) => {
                        return Rx.Observable.from([
                        assessmentsLoadError(e.message || e)
                    ]);
                    })
            .concat([assessmentsLoading(false)]);
            })
};
