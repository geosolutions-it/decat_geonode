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

const {Accordion, Panel} = require('react-bootstrap');

const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const {loadRegions, selectRegions, addEvent, changeEventProperty, toggleDraw, cancelEdit} = require('../actions/alerts');
const {connect} = require('react-redux');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const HazardsFilter = connect((state) => ({
    title: "decatwarning.hazardsfilter",
    entities: state.alerts && state.alerts.hazards || []
}))(require('../components/MultiValueFilter'));

const LevelsFilter = connect((state) => ({
    title: "decatwarning.levelsfilter",
    entities: state.alerts && state.alerts.levels || []
}))(require('../components/MultiValueFilter'));

const LocationFilter = connect((state) => ({
        regions: state.alerts && state.alerts.regions || {},
        regionsLoading: state.alerts && state.alerts.regionsLoading || false,
        selectedRegions: state.alerts && state.alerts.selectedRegions || []
 }), {
     loadRegions,
     selectRegions,
    onUpdate: () => {}})(require('../components/LocationFilter'));

const Events = connect((state) => ({
    events: state.alerts && state.alerts.events || [],
    page: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.page || 0,
    total: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.total || 0
}), {
    onAddEvent: addEvent
})(require('../components/Events'));

const EventEditor = connect((state) => ({
    hazards: state.alerts && state.alerts.hazards || [],
    levels: state.alerts && state.alerts.levels || [],
    currentEvent: state.alerts && state.alerts.currentEvent || {},
    regions: state.alerts && state.alerts.regions || {},
    regionsLoading: state.alerts && state.alerts.regionsLoading || false,
    drawEnabled: state.alerts && state.alerts.drawEnabled || false
}), {
    onChangeProperty: changeEventProperty,
    loadRegions,
    onToggleDraw: toggleDraw,
    onClose: cancelEdit
})(require('../components/EventEditor'));

class EarlyWarning extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        mode: PropTypes.string
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        height: 798
    };

    renderList = () => {
        const accordionHeight = this.props.height - (50 + 41 + 52 + 5 + 52 + 5 + 72);
        return (<div id="decat-early-warning" key="decat-early-warning" className="decat-accordion" >
            <Accordion defaultActiveKey="1">
                <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.alerts")}</div></span>} eventKey="1" collapsible>
                    <div style={{overflow: 'hidden', height: accordionHeight}}>
                        <Events height={accordionHeight}/>
                    </div>
                </Panel>
                <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.filter")}</div></span>} eventKey="2" collapsible>
                    <div style={{overflow: 'auto', height: accordionHeight}}>
                        <LocationFilter title="decatwarning.regionsfilter" placeholder={LocaleUtils.getMessageById(this.context.messages, "decatwarning.locationplaceholder")}/>
                        <HazardsFilter/>
                        <LevelsFilter/>
                    </div>
                </Panel>
            </Accordion>
        </div>);
    };

    renderForm = () => {
        const height = this.props.height - (50 + 41 + 42);
        return <EventEditor key="decat-event-editor" height={height} mode={this.props.mode}/>;
    };

    render() {
        return (
        <ReactCSSTransitionGroup
            transitionName="early-warning-transition"
            transitionAppearTimeout={300}
            transitionLeaveTimeout={300}>
            {this.props.mode === 'LIST' ? this.renderList() : this.renderForm()}
        </ReactCSSTransitionGroup>);
    }
}

const EarlyWarningPlugin = connect((state) => ({
    mode: state.alerts && state.alerts.mode || 'LIST',
    height: state.map && state.map.present && state.map.present.size && state.map.present.size.height || 798
}))(EarlyWarning);

module.exports = {
    EarlyWarningPlugin: assign(EarlyWarningPlugin,
    {
        DrawerMenu: {
            name: 'early-warning',
            position: 1,
            glyph: "flash",
            title: 'earlywarning',
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "earlywarning"
            },
            priority: 1
        }
    }),
    epics: require('../epics/alerts'),
    reducers: {
        alerts: require('../reducers/alerts')
    }

};
