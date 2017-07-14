/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Button, ButtonGroup} = require('react-bootstrap');
const PropTypes = require('prop-types');
const moment = require('moment');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

class TimeFilter extends React.Component {
    static propTypes = {
        intervals: PropTypes.array,
        currentInterval: PropTypes.object,
        changeInterval: PropTypes.function,
        currentTime: PropTypes.object,
        dateTimeFormat: PropTypes.string
    };

    static defaultProps = {
        dateTimeFormat: "YYYY-MM-DD hh:mm:ss a",
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
        currentTime: moment(),
        currentInterval: {
            label: "1hour",
            value: 1,
            period: 'hours'
        },
        changeInterval: () => {}
    }
    renderIntervals = () => {
        return this.props.intervals.map((interval, idx) => <Button key={idx} active={
            interval.label === this.props.currentInterval.label} onClick={() => {this.handleClick(idx); }}>
            <Message msgId={"timefilter.intervals." + interval.label}/></Button>);
    };
    renderCurrentInterval = () => {
        const {currentInterval, currentTime, dateTimeFormat} = this.props;
        const _to = currentTime.format(dateTimeFormat);
        const _from = currentInterval.value ? currentTime.clone().subtract(currentInterval.value, currentInterval.period).format(dateTimeFormat) : ' --';
        return (<div id="decat-time-filter-current-interval" className="pull-left">
            <label><Message msgId="timefilter.from"/></label><span>{_from}</span><br/>
            <label><Message msgId="timefilter.to"/></label><span>{_to}</span>
        </div>);
    };

    render() {
        return (
            <div id="decat-time-filter" className="flex-center">
                <div className="pull-left">
                    <label><Message msgId="timefilter.title"/>&nbsp;</label>
                    <ButtonGroup>
                        {this.renderIntervals()}
                    </ButtonGroup>
                </div>
                {this.renderCurrentInterval()}
            </div>
        );
    }
    handleClick = (key) => {
        this.props.changeInterval(this.props.intervals[key]);
    }
}

module.exports = TimeFilter;
