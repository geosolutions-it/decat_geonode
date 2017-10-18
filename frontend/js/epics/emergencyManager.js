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
const {show} = require('../../MapStore2/web/client/actions/notifications');
const {updateNode} = require('../../MapStore2/web/client/actions/layers');
const {setControlProperty} = require('../../MapStore2/web/client/actions/controls');
const {EDIT_COP} = require('../actions/emergencymanager');
const {MAP_CONFIG_LOADED} = require('../../MapStore2/web/client/actions/config');
const {SAVE_ANNOTATION, CONFIRM_REMOVE_ANNOTATION, saveAnnotation} = require('../../MapStore2/web/client/actions/annotations');
const {addLayer} = require('../../MapStore2/web/client/actions/layers');

const assign = require('object-assign');
const {ADD_ASSESSMENT} = require('../actions/impactassessment');
const hazardIdSelector = state => state && state.impactassessment && state.impactassessment.currentHazard && state.impactassessment.currentHazard.id;
const currentRoleSelector = state => state && state.security && state.security.currentRole;

const annotationsStyle = {
    iconGlyph: 'comment',
    iconShape: 'square',
    iconColor: 'blue'
};

const annotationRefreshTimeSelector = state => state && state.impactassessment && state.impactassessment.annotationRefreshTime || 5000;

const getExternals = (store, viewer) => {
    const hazardId = hazardIdSelector(store.getState());
    const currentRole = currentRoleSelector(store.getState());
    return Rx.Observable.fromPromise(axios.get(`/decat/api/alerts/${hazardId}/annotations/?format=json`).then(response => response.data))
        .switchMap(data => {
            const dataFeatures = data.features || [];
            const annotations = annotationsLayerSelector(store.getState());

            if (!annotations) {
                const externalFeatures = dataFeatures.map(f => {
                    const style = f.properties && f.properties.style ? assign({}, f.properties.style) : annotationsStyle;
                    return assign({}, f, { style, properties: assign({}, f.properties, {id: 'external_' + f.id})});
                });
                return Rx.Observable.of(addLayer({
                    type: 'vector',
                    visibility: true,
                    id: 'annotations',
                    name: "Annotations",
                    rowViewer: viewer,
                    hideLoading: true,
                    style: annotationsStyle,
                    features: externalFeatures,
                    handleClickOnLayer: true
                }));
            }
            const copFeatures = annotations.features ? [...annotations.features.filter(f => !f.properties.id.match(/external_/)).map(f => assign({}, f, {readOnly: currentRole === 'emergency-manager'}))] : [];
            const externalFeatures = dataFeatures.map(f => {
                const style = f.properties && f.properties.style ? assign({}, f.properties.style) : annotationsStyle;
                return assign({}, f, { style, properties: assign({}, f.properties, {id: 'external_' + f.id})});
            });

            const features = [...copFeatures, ...externalFeatures];
            return Rx.Observable.of(updateNode("annotations", "layers", {features}));

        })
        .catch(() => {
            return Rx.Observable.of(show({
                title: "annotation.external",
                message: "annotation.externalError",
                autoDismiss: 6,
                position: "tr"
        }, 'error')); });
};

module.exports = (viewer) => ({
    openAnnotationOnStart: action$ => action$.ofType(EDIT_COP)
        .switchMap(() => Rx.Observable.of(setControlProperty('annotations', 'enabled', true))),
    getExternalAnnotations: (action$, store) => action$.ofType(EDIT_COP, ADD_ASSESSMENT)
        .switchMap(() =>
            action$.ofType(MAP_CONFIG_LOADED)
                .take(1)
                .switchMap(() => Rx.Observable.timer(0, annotationRefreshTimeSelector(store.getState()))
                    .switchMap(() => getExternals(store, viewer))
                    .takeUntil(action$.ofType("RESTORE_DECAT"))
                )),
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
                    return !features ? Rx.Observable.empty() : Rx.Observable.of(
                        updateNode("annotations", "layers", {features}),
                        show({
                            title: "annotation.save",
                            message: "annotation.saved",
                            autoDismiss: 6,
                            position: "tr"
                        }, 'success')
                    );
                })
                .catch(() => {
                    const annotations = annotationsLayerSelector(store.getState());
                    const features = annotations && annotations.features.filter(annotation =>
                        annotation.properties && annotation.properties.id !== action.id
                    ) || null;
                    return Rx.Observable.of(
                        updateNode("annotations", "layers", {features}),
                        show({
                            title: "annotation.save",
                            message: "annotation.saveError",
                            autoDismiss: 6,
                            position: "tr"
                }, 'error')); });
            }),
    deleteExternalAnnotations: (action$, store) =>
        action$.ofType(CONFIRM_REMOVE_ANNOTATION)
            .filter(action => action.id && action.id.match(/external_/))
            .switchMap((action) => {
                const id = action.id.replace(/external_/, '');
                const hazardId = hazardIdSelector(store.getState());
                return Rx.Observable.fromPromise(axios.delete(`/decat/api/alerts/${hazardId}/annotations/${id}/`).then(response => response.data)).switchMap(() => {
                    return Rx.Observable.of(
                        show({
                            title: "annotation.delete",
                            message: "annotation.deleted",
                            autoDismiss: 6,
                            position: "tr"
                        }, 'success'));
                })
                .catch(() => {
                    return Rx.Observable.of(show({
                    title: "annotation.delete",
                    message: "annotation.deleteError",
                    autoDismiss: 6,
                    position: "tr"
                }, 'error')); });
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
                    return Rx.Observable.of(
                        show({
                            title: "annotation.edit",
                            message: "annotation.edited",
                            autoDismiss: 6,
                            position: "tr"
                        }, 'success'));
                })
                .catch((error) => {
                    if (error && error.statusText && error.statusText === 'NOT FOUND') {
                        return Rx.Observable.of(show({
                            title: "annotation.notFound",
                            message: "annotation.createAgain",
                            autoDismiss: 6,
                            position: "tr",
                            action: {
                                label: "Yes",
                                dispatch: saveAnnotation(action.id, action.fields, action.geometry, action.style, true)
                            }
                        }, 'warning'));
                    }
                    return Rx.Observable.of(show({
                    title: "annotation.edit",
                    message: "annotation.editError",
                    autoDismiss: 6,
                    position: "tr"
                }, 'error')); });
            })
});
