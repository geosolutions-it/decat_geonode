/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col, Glyphicon} = require('react-bootstrap');
const PropTypes = require('prop-types');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

class TimeFilter extends React.Component {
    static propTypes = {
        intervals: PropTypes.array,
        currentInterval: PropTypes.object,
        changeInterval: PropTypes.func
    };

    static defaultProps = {
        intervals: [{
            label: "1hour",
            value: 1,
            period: 'hours'
        }, {
            label: "10hours",
            value: 10,
            period: 'hours'
        }, {
            label: "1day",
            value: 1,
            period: 'days'
        }, {
            label: "1week",
            value: 1,
            period: 'weeks'
        }, {
            label: "all"
        }],
        currentInterval: {
            label: "1hour",
            value: 1,
            period: 'hours'
        },
        changeInterval: () => {}
    }
    renderIntervals = () => {
        return this.props.intervals.map((interval, idx) => {
            const checked = interval.label === this.props.currentInterval.label;
            return (
                <div key={idx} className="checkbox d-checkbox-invisible">
                    <label>
                        <input type="radio" key={idx} checked={checked} onChange={() => {this.handleClick(idx); }}/>
                        <Glyphicon className="event-check" glyph={checked ? 'check' : 'unchecked'}/>
                         &nbsp;<Message msgId={"timefilter.intervals." + interval.label}/>
                    </label>
                </div>);
        });
    }
    render() {
        return (
            <div className="d-hazard">
                <Grid fluid>
                    <Row>
                        <Col xs={12}>
                            <h5><b><Message msgId="timefilter.title"/></b></h5>
                            {this.renderIntervals()}
                        </Col>
                    </Row>
                </Grid>
            </div>);
    }
    handleClick = (key) => {
        this.props.changeInterval(this.props.intervals[key]);
    }
}

module.exports = TimeFilter;
