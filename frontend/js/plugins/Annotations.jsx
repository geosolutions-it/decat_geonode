/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');
const {AnnotationsPlugin, epics, reducers} = require('../../MapStore2/web/client/plugins/Annotations');
const {connect} = require('../../MapStore2/web/client/utils/PluginsUtils');

const {editAnnotation, removeAnnotation, cancelEditAnnotation,
    saveAnnotation, toggleAdd, validationError, removeAnnotationGeometry, toggleStyle, setStyle, restoreStyle} =
    require('../../MapStore2/web/client/actions/annotations');
const {annotationsInfoSelector} = require('../../MapStore2/web/client/selectors/annotations');

const AnnotationsInfoViewer = connect(annotationsInfoSelector,
{
    onEdit: editAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onError: validationError,
    onSave: saveAnnotation,
    onRemove: removeAnnotation,
    onAddGeometry: toggleAdd,
    onStyleGeometry: toggleStyle,
    onCancelStyle: restoreStyle,
    onSaveStyle: toggleStyle,
    onSetStyle: setStyle,
    onDeleteGeometry: removeAnnotationGeometry
})(require('../../MapStore2/web/client/components/mapcontrols/annotations/AnnotationsEditor'));

const BurgerMenu = assign(AnnotationsPlugin.BurgerMenu, {
            selector: (state) => {
                // For the moment annotations are available only for an impact-assessor editng an assessment
                const {security, impactassessment} = state;
                const {currentRole} = security || {};

                if (currentRole === "emergency-manager" && impactassessment && impactassessment.mode === 'EDIT_COP') {
                    return {};
                }
                if ( currentRole !== "impact-assessor" || (!impactassessment || !impactassessment.newAssessment)) {
                    return { style: {display: "none"} };
                }
                return {};
            }
        });

module.exports = {
    AnnotationsPlugin: assign(AnnotationsPlugin, {BurgerMenu}),
    reducers,
    epics: assign({}, epics, require('../epics/emergencyManager')(AnnotationsInfoViewer))
};
