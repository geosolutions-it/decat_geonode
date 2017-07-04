/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Glyphicon} = require('react-bootstrap');

const TimeFilter = require('../components/TimeFilter');

class Header extends React.Component {
    render() {
        return (
            <div id="decat-viewer-header">
                <TimeFilter/>
                <Button bsStyle="primary" className="square-button"><Glyphicon glyph="user"/></Button>
            </div>
        );
    }
}

module.exports = {
    HeaderPlugin: Header
};
