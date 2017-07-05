/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, Glyphicon, Grid, Row, Col} = require('react-bootstrap');

const TimeFilter = require('../components/TimeFilter');

class Header extends React.Component {
    render() {
        return (
            <div id="decat-viewer-header">
                <Grid fluid style={{width: '100%'}}>
                <Row>
                    <Col xs="11">
                        <TimeFilter/>
                    </Col>
                    <Col xs="1">
                        <Button bsStyle="primary" className="square-button pull-right"><Glyphicon glyph="user"/></Button>
                    </Col>
                </Row>
                </Grid>
            </div>
        );
    }
}

module.exports = {
    HeaderPlugin: Header
};
