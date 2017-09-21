/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const assign = require('object-assign');

const {DrawerMenuPlugin, reducers, epics} = require('../../MapStore2/web/client/plugins/DrawerMenu');

module.exports = {
    DrawerMenuPlugin: assign(DrawerMenuPlugin, {
        disablePluginIf: "{state('currentRole') !== 'event-operator' && state('currentRole') !== 'impact-assessor' && state('currentRole') !== 'emergency-manager'}"
       }),
    reducers,
    epics
};
