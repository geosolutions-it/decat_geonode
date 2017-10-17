/**
* Copyright 2017, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const Rx = require('rxjs');
const axios = require('../../MapStore2/web/client/libs/ajax');
const {annotationsLayerSelector} = require('../../MapStore2/web/client/selectors/annotations');
const {updateNode} = require('../../MapStore2/web/client/actions/layers');
// const {TOGGLE_CONTROL} = require('../../MapStore2/web/client/actions/controls');
const {EDIT_COP} = require('../actions/emergencymanager');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {SAVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION} = require('../../MapStore2/web/client/actions/annotations');
const assign = require('object-assign');
const {ADD_ASSESSMENT} = require('../actions/impactassessment');
const hazardIdSelector = state => state && state.impactassessment && state.impactassessment.currentHazard && state.impactassessment.currentHazard.id;
const currentRoleSelector = state => state && state.security && state.security.currentRole;

module.exports = {
    getExternalAnnotations: (action$, store) => action$.ofType(EDIT_COP, ADD_ASSESSMENT)
        .switchMap(() =>
            action$.ofType(MAP_CONFIG_LOADED)
                .switchMap(() => {
                    const hazardId = hazardIdSelector(store.getState());
                    const currentRole = currentRoleSelector(store.getState());
                    return Rx.Observable.fromPromise(axios.get(`/decat/api/alerts/${hazardId}/annotations/?format=json`).then(response => response.data))
                        .switchMap(data => {
                            const dataFeatures = data.features;
                            const annotations = annotationsLayerSelector(store.getState());
                            if (!annotations || !dataFeatures) {
                                return Rx.Observable.empty();
                            }
                            const copFeatures = annotations.features ? [...annotations.features.map(f => assign({}, f, {readOnly: currentRole === 'emergency-manager'}))] : [];
                            const externalFeatures = dataFeatures.map(f => {
                                const style = f.properties && f.properties.style ? assign({}, f.properties.style) : {iconColor: "blue", iconGlyph: "comment", iconShape: "square"};
                                return assign({}, f, { style, properties: assign({}, f.properties, {id: 'external_' + f.id})});
                            });

                            const features = [...copFeatures, ...externalFeatures];
                            return Rx.Observable.of(updateNode("annotations", "layers", {features}));

                        })
                        .catch((/*error*/) => Rx.Observable.empty());
                })),
    saveExternalAnnotations: (action$, store) =>
        action$.ofType(SAVE_ANNOTATION)
            .filter(action => action.newFeature && currentRoleSelector(store.getState()) === 'emergency-manager')
            .switchMap((action) => {
                const hazardId = hazardIdSelector(store.getState());
                const styleKeys = Object.keys(action.style).filter(key => key !== 'highlight');
                const style = styleKeys.reduce((a, b) => assign({}, a, {[b]: action.style[b]}), {});
                const properties = assign({}, action.fields, {hazard: hazardId}, {style: JSON.stringify(style)});
                const geometry = assign({}, action.geometry);
                return Rx.Observable.fromPromise(axios.post(`/decat/api/alerts/${hazardId}/annotations/`, {geometry, properties}).then(response => response.data)).switchMap((res) => {
                    const annotations = annotationsLayerSelector(store.getState());
                    const features = annotations && annotations.features.map(annotation => {
                        if (annotation.properties && annotation.properties.id === action.id) {
                            const prprts = assign({}, annotation.properties, {id: 'external_' + res.id});
                            return assign({}, annotation, {properties: prprts});
                        }
                        return assign({}, annotation);
                    }) || null;
                    return !features ? Rx.Observable.empty() : Rx.Observable.of(updateNode("annotations", "layers", {features}));
                })
                .catch(() => Rx.Observable.empty());
            }),
    deleteExternalAnnotations: (action$, store) =>
        action$.ofType(CONFIRM_REMOVE_ANNOTATION)
            .filter(action => action.id && action.id.match(/external_/))
            .switchMap((action) => {
                const id = action.id.replace(/external_/, '');
                const hazardId = hazardIdSelector(store.getState());
                return Rx.Observable.fromPromise(axios.delete(`/decat/api/alerts/${hazardId}/annotations/${id}/`).then(response => response.data)).switchMap(() => {
                    return Rx.Observable.empty();
                })
                .catch(() => Rx.Observable.empty());
            }),
    editExternalAnnotations: (action$, store) =>
        action$.ofType(SAVE_ANNOTATION)
            .filter(action => !action.newFeature && action.id && action.id.match(/external_/))
            .switchMap((action) => {
                const id = action.id.replace(/external_/, '');
                const hazardId = hazardIdSelector(store.getState());
                const styleKeys = Object.keys(action.style).filter(key => key !== 'highlight');
                const style = styleKeys.reduce((a, b) => assign({}, a, {[b]: action.style[b]}), {});
                const properties = assign({}, action.fields, {hazard: hazardId}, {style: JSON.stringify(style)});
                const geometry = assign({}, action.geometry);
                return Rx.Observable.fromPromise(axios.patch(`/decat/api/alerts/${hazardId}/annotations/${id}/`, {geometry, properties}).then(response => response.data)).switchMap(() => {

                    return Rx.Observable.empty();
                })
                .catch(() => Rx.Observable.empty());
            })
};
