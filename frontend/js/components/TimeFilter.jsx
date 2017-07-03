/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button} = require('react-bootstrap');
const PropTypes = require('prop-types');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

class TimeFilter extends React.Component {
    static propTypes = {
        intervals: PropTypes.array,
        currentInterval: PropTypes.object
    };

    static defaultProps = {
        intervals: [{
            label: "1hour"
        }, {
            label: "10hours"
        }, {
            label: "1day"
        }, {
            label: "1week"
        }],
        currentInterval: {
            from: new Date(),
            to: new Date()
        }
    };

    renderIntervals = () => {
        return this.props.intervals.map((interval) => <Button><Message msgId={"timefilter.intervals." + interval.label}/></Button>);
    };


    renderCurrentInterval = () => {
        return (<div id="decat-time-filter-current-interval">
            <label><Message msgId="timefilter.from"/></label><span>{this.props.currentInterval.from.toString()}</span><br/>
            <label><Message msgId="timefilter.to"/></label><span>{this.props.currentInterval.to.toString()}</span>
        </div>);
    };

    render() {
        return (
            <div id="decat-time-filter">
                <div id="decat-time-filter-intervals">
                    <label><Message msgId="timefilter.title"/></label>
                    {this.renderIntervals()}
                </div>
                {this.renderCurrentInterval()}
            </div>
        );
    }
}

module.exports = TimeFilter;
