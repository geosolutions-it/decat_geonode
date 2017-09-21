/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const assign = require('object-assign');

const {mapConfigHistory, createHistory} = require('../../MapStore2/web/client/utils/MapHistoryUtils');

const map = mapConfigHistory(require('../../MapStore2/web/client/reducers/map'));

const layers = require('../../MapStore2/web/client/reducers/layers');
const mapConfig = require('../../MapStore2/web/client/reducers/config');

const DebugUtils = require('../../MapStore2/web/client/utils/DebugUtils');
const {combineReducers, combineEpics} = require('../../MapStore2/web/client/utils/PluginsUtils');

const LayersUtils = require('../../MapStore2/web/client/utils/LayersUtils');
const {CHANGE_BROWSER_PROPERTIES} = require('../../MapStore2/web/client/actions/browser');
const {createEpicMiddleware} = require('redux-observable');

const SecurityUtils = require('../../MapStore2/web/client/utils/SecurityUtils');
const ListenerEnhancer = require('@carnesen/redux-add-action-listener-enhancer').default;

const {routerReducer, routerMiddleware} = require('react-router-redux');
const routerCreateHistory = require('history/createHashHistory').default;
const history = routerCreateHistory();

// Build the middleware for intercepting and dispatching navigation actions
const reduxRouterMiddleware = routerMiddleware(history);


module.exports = (initialState = {defaultState: {}, mobile: {}}, appReducers = {}, appEpics = {}, plugins, storeOpts = {}) => {
    const allReducers = combineReducers(plugins, {
        ...appReducers,
        localConfig: require('../../MapStore2/web/client/reducers/localConfig'),
        locale: require('../../MapStore2/web/client/reducers/locale'),
        browser: require('../../MapStore2/web/client/reducers/browser'),
        controls: require('../../MapStore2/web/client/reducers/controls'),
        theme: require('../../MapStore2/web/client/reducers/theme'),
        help: require('../../MapStore2/web/client/reducers/help'),
        map: () => {return null; },
        mapInitialConfig: () => {return null; },
        layers: () => {return null; },
        routing: routerReducer
    });
    const rootEpic = combineEpics(plugins, appEpics);
    const optsState = storeOpts.initialState || {defaultState: {}, mobile: {}};
    const defaultState = assign({}, initialState.defaultState, optsState.defaultState);
    const mobileOverride = assign({}, initialState.mobile, optsState.mobile);
    const epicMiddleware = createEpicMiddleware(rootEpic);
    const rootReducer = (state, action) => {
        let mapState = createHistory(LayersUtils.splitMapAndLayers(mapConfig(state, action)));
        let newState = {
            ...allReducers(state, action),
            map: mapState && mapState.map ? map(mapState.map, action) : null,
            mapInitialConfig: mapState && mapState.mapInitialConfig || mapState && mapState.loadingError && {
                loadingError: mapState.loadingError
            } || null,
            layers: mapState ? layers(mapState.layers, action) : null
        };
        if (action && action.type === CHANGE_BROWSER_PROPERTIES && newState.browser.mobile) {
            newState = assign(newState, mobileOverride);
        }
        if ( action && action.type === 'RESTORE_DECAT') {
            newState = assign(newState, action.state);
        }

        return newState;
    };
    let store;
    let enhancer;
    if (storeOpts && storeOpts.notify) {
        enhancer = ListenerEnhancer;
    }
    if (storeOpts && storeOpts.persist) {
        storeOpts.persist.whitelist.forEach((fragment) => {
            const fragmentState = localStorage.getItem('mapstore2.persist.' + fragment);
            if (fragmentState) {
                defaultState[fragment] = JSON.parse(fragmentState);
            }
        });
        if (storeOpts.onPersist) {
            setTimeout(() => {storeOpts.onPersist(); }, 0);
        }
    }
    store = DebugUtils.createDebugStore(rootReducer, defaultState, [epicMiddleware, reduxRouterMiddleware], enhancer);
    if (storeOpts && storeOpts.persist) {
        const persisted = {};
        store.subscribe(() => {
            storeOpts.persist.whitelist.forEach((fragment) => {
                const fragmentState = store.getState()[fragment];
                if (fragmentState && persisted[fragment] !== fragmentState) {
                    persisted[fragment] = fragmentState;
                    localStorage.setItem('mapstore2.persist.' + fragment, JSON.stringify(fragmentState));
                }
            });
        });
    }
    SecurityUtils.setStore(store);
    return store;
};
