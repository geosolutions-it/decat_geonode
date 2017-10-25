/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');
const {AnnotationsPlugin, reducers} = require('../../MapStore2/web/client/plugins/Annotations');
const {connect} = require('../../MapStore2/web/client/utils/PluginsUtils');

const {editAnnotation, removeAnnotation, cancelEditAnnotation,
    saveAnnotation, toggleAdd, validationError, removeAnnotationGeometry, toggleStyle, setStyle, restoreStyle} =
    require('../../MapStore2/web/client/actions/annotations');
const {annotationsInfoSelector} = require('../../MapStore2/web/client/selectors/annotations');
const {createSelector} = require('reselect');

const {hazardIdSelector} = require('../selectors/impactassessment');
const {mapSelector} = require('../../MapStore2/web/client/selectors/map');
const {annotationsListSelector} = require('../../MapStore2/web/client/selectors/annotations');
const {head} = require('lodash');

const ShareUtils = require('../../MapStore2/web/client/utils/ShareUtils');

const annotationSelector = createSelector([annotationsListSelector], (annotations) => {
    const id = annotations.current;
    return head(annotations.annotations.filter(a => a.properties.id === id));
});

const permalinkInfoSelector = createSelector([hazardIdSelector, mapSelector, annotationSelector], (hazardId, map) => ({
    baseUrl: ShareUtils.getApiUrl(location.href) + '#',
    hazard: hazardId,
    map: map && map.mapId
}));

const permalinkSelector = createSelector([permalinkInfoSelector, annotationSelector], (permalinkInfo, annotation) => ({
    ...permalinkInfo,
    annotation: annotation
}));

const Permalink = connect(permalinkSelector)(require('../components/Permalink'));
const PermalinkInfo = connect(permalinkInfoSelector)(require('../components/Permalink'));

const baseFields = [
    {
        name: 'title',
        type: 'text',
        validator: (val) => val,
        validateError: 'annotations.mandatory',
        showLabel: false,
        editable: true
    },
    {
        name: 'permalink',
        type: 'component',
        showLabel: true,
        editable: false
    },
    {
        name: 'description',
        type: 'html',
        showLabel: true,
        editable: true
    }
];

const fields = baseFields.map(f => assign({}, f, f.name === 'permalink' ? {
    value: Permalink
} : {}));

const fieldsInfo = baseFields.map(f => assign({}, f, f.name === 'permalink' ? {
    value: PermalinkInfo
} : {}));


const infoViewerSelector = createSelector([
    annotationsInfoSelector
], (info) => (assign({}, info, {
    config: assign({}, info.config || {}, {
        fields: fieldsInfo
    })
})));

const AnnotationsInfoViewer = connect(infoViewerSelector,
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
    AnnotationsPlugin: assign(AnnotationsPlugin, {BurgerMenu}, {
        cfg: {
            config: {
                fields,
                defaultStyle: {
                    iconGlyph: "building",
                    iconColor: "red",
                    iconShape: "circle"
                },
                glyphs: [
                  {label: "Command & Control HQ", value: "building"},
                  {label: "Command & control Local office/unit", value: "gears"},
                  {label: "Hospital", value: "h-square"},
                  {label: "Field hospital", value: "medkit"},
                  {label: "Gathering area", value: "truck"},
                  {label: "Evacuation assembly area", value: "users"},
                  {label: "Temporary camp /shelter area", value: "bed"},
                  {label: "Food and beverages", value: "cutlery"},
                  {label: "Security", value: "shield"},
                  {label: "Army", value: "angle-double-down"},
                  {label: "Coast Guard", value: "ship"},
                  {label: "Fire rescue", value: "fire-extinguisher"},
                  {label: "Water rescue", value: "life-ring"},
                  {label: "Medical rescue", value: "ambulance"}
                ]
            }
        }
    }),
    reducers,
    epics: assign({}, require('../../MapStore2/web/client/epics/annotations')(AnnotationsInfoViewer),
        require('../../MapStore2/web/client/epics/controls'), require('../epics/emergencyManager')(AnnotationsInfoViewer))
};
