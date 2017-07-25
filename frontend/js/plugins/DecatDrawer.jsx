/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const {connect} = require('react-redux');
const {Button, Glyphicon, Panel} = require('react-bootstrap');
const Sidebar = require('react-sidebar').default;
const {toggleControl} = require('../../MapStore2/web/client/actions/controls');
const Message = require('../../MapStore2/web/client/plugins/locale/Message');
const {DrawerMenuPlugin, reducers, epics} = require('../../MapStore2/web/client/plugins/DrawerMenu');
module.exports = {
    DrawerMenuPlugin: assign(DrawerMenuPlugin, {
        disablePluginIf: "{state('currentRole') !== 'event-operator'}",
       }),
    reducers,
    epics

};
