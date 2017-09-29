/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');
const {AnnotationsPlugin, epics, reducers} = require('../../MapStore2/web/client/plugins/Annotations');
const BurgerMenu = assign(AnnotationsPlugin.BurgerMenu, {
            selector: (state) => {
                // For the moment annotations are available only for an impact-assessor editng an assessment
                const {security, impactassessment} = state;
                const {currentRole} = security || {};
                if ( currentRole !== "impact-assessor" || (!impactassessment || !impactassessment.newAssessment)) {
                    return { style: {display: "none"} };
                }
                return {};
            }
        });

module.exports = {
    AnnotationsPlugin: assign(AnnotationsPlugin, {BurgerMenu}),
    reducers,
    epics
};
