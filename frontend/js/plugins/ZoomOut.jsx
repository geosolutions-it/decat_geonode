/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {connect} = require('react-redux');
const {ZoomOutPlugin} = require('../../MapStore2/web/client/plugins/ZoomOut');

module.exports = {
    ZoomOutPlugin: connect((state) => ({ minZoom: state.alerts && state.alerts.minZoom || 0}))(ZoomOutPlugin)
};
