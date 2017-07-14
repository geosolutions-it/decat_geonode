/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const {connect} = require('react-redux');
const {changeInterval} = require('../actions/alerts');
const TimeFilter = connect((state) => ({
        currentInterval: state.alerts && state.alerts.currentInterval,
        currentTime: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.queryTime
    }), {
        changeInterval
    })(require('../components/TimeFilter'));

class Header extends React.Component {
    render() {
        return (
            <div id="decat-viewer-header">
                <Grid fluid style={{width: '100%'}}>
                <Row>
                    <Col xs="12">
                        <TimeFilter/>
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
