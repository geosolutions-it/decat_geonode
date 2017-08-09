/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');
const {connect} = require('react-redux');
const assign = require('object-assign');
const moment = require('moment');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

class CurrentIntervalFooter extends React.Component {
    static propTypes = {
        currentInterval: PropTypes.object,
        currentTime: PropTypes.object,
        dateTimeFormat: PropTypes.string
    };

    static defaultProps = {
        dateTimeFormat: "YYYY-MM-DD hh:mm:ss A",
        currentTime: moment(),
        currentInterval: {
            label: "1hour",
            value: 1,
            period: 'hours'
        }
    }

    render() {
        const {currentInterval, currentTime, dateTimeFormat} = this.props;
        const _to = currentTime.format(dateTimeFormat);
        const _from = currentInterval.value ? currentTime.clone().subtract(currentInterval.value, currentInterval.period).format(dateTimeFormat) : ' --';
        return (<div id="decat-time-filter-current-interval" className="row">
                    <strong><Message msgId="timefilter.from"/></strong><span>{_from}</span><br/>
                    <strong><Message msgId="timefilter.to"/></strong><span>{_to}</span>
                </div>);
    }
}

module.exports = {
    CurrentIntervalFooterPlugin: assign(connect((state) => ({
    currentTime: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.queryTime,
    currentInterval: state.alerts && state.alerts.currentInterval
}))(CurrentIntervalFooter),
    {disablePluginIf: "{state('currentRole') !== 'event-operator' && state('currentRole') !== 'impact-assessor'}"})
};
