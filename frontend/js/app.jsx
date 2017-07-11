/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const ReactDOM = require('react-dom');
const {connect} = require('react-redux');
const LocaleUtils = require('../MapStore2/web/client/utils/LocaleUtils');
const ConfigUtils = require('../MapStore2/web/client/utils/ConfigUtils');

const startApp = () => {
    ConfigUtils.setLocalConfigurationFile('/static/decat/localConfig.json');
    const StandardApp = require('../MapStore2/web/client/components/app/StandardApp');

    const {pages, pluginsDef, initialState, storeOpts, appEpics = {}} = require('./appConfig');

    const StandardRouter = connect((state) => ({
        locale: state.locale || {},
        pages
    }))(require('../MapStore2/web/client/components/app/StandardRouter'));

    const appStore = require('../MapStore2/web/client/stores/StandardStore').bind(null, initialState, {
        security: require('./reducers/security')
    }, appEpics);

    const {loadHazards, loadLevels, loadRegions, loadEvents} = require('./actions/alerts');
    const {loadUserInfo} = require('./actions/security');

    const initialActions = [loadHazards, loadLevels, loadRegions, loadEvents, loadUserInfo];

    LocaleUtils.setSupportedLocales({
        "it": {
            code: "it-IT",
            description: "Italiano"
        },
        "en": {
            code: "en-US",
            description: "English"
        }
    });

    LocaleUtils.getUserLocale = () => LocaleUtils.getSupportedLocales()[window.MS2Language || 'en'] && LocaleUtils.getSupportedLocales()[window.MS2Language || 'en'].code || 'en-US';

    const appConfig = {
        storeOpts,
        appEpics,
        appStore,
        pluginsDef,
        initialActions,
        appComponent: StandardRouter,
        printingEnabled: true
    };

    ReactDOM.render(
        <StandardApp {...appConfig} themeCfg={{prefixContainer: '#decat', path: '/static/decat/themes'}}/>,
        document.getElementById('decat')
    );
};

if (!global.Intl ) {
    // Ensure Intl is loaded, then call the given callback
    LocaleUtils.ensureIntl(startApp);
} else {
    startApp();
}
