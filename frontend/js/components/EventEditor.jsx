/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col, Glyphicon, FormControl, Button} = require('react-bootstrap');
const PropTypes = require('prop-types');

const Select = require('react-select');

const Message = require('../../MapStore2/web/client/components/I18N/Message');
const {DateTimePicker} = require('react-widgets');

/*const LocationFilter = connect((state) => ({
        regions: state.alerts && state.alerts.regions || {},
        regionsLoading: state.alerts && state.alerts.regionsLoading || false,
        selectedRegions: state.alerts && state.alerts.selectedRegions || []
 }), {loadRegions, selectRegions})(require('../components/LocationFilter'));*/

const LocationFilter = require('../components/LocationFilter');

class EventEditor extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        mode: PropTypes.string,
        currentEvent: PropTypes.object,
        hazards: PropTypes.array,
        levels: PropTypes.array,
        onSave: PropTypes.func,
        onChangeProperty: PropTypes.func,
        loadRegions: PropTypes.func,
        regions: PropTypes.onject,
        regionsLoading: PropTypes.bool,
        selectedRegions: PropTypes.array,
        drawEnabled: PropTypes.bool,
        onToggleDraw: PropTypes.func,
        onClose: PropTypes.func
    };

    static defaultProps = {
        className: 'd-hazard',
        onSave: () => {},
        onChangeProperty: () => {},
        loadRegions: () => {},
        onToggleDraw: () => {},
        onClose: () => {},
        cuurentEvent: {},
        mode: 'ADD',
        regions: [],
        regionsLoading: false,
        drawEnabled: false
    };

    renderHazard = () => {
        if (this.props.mode === 'ADD') {
            return <Select options={this.props.hazards} value={this.props.currentEvent.hazard} onChange={this.selectHazard} optionRenderer={this.renderHazardOption} valueRenderer={this.renderHazardValue}/>;
        }
        return <h5 className={"fa icon-" + this.props.currentEvent.hazard.icon + " d-text-warning fa-2x"}></h5>;
    };

    renderHazardOption = (option) => {
        return (<div className="Select-value" title={option.description}>
                <span className="Select-value-label">
                    <span className={"fa icon-" + option.icon}></span>
                </span>
            </div>);
    };

    renderHazardValue = (value) => {
        return value ? (<div className="Select-value" title={value.description}>
                <span className="Select-value-label">
                    <span className={"fa icon-" + value.icon}></span>
                </span>
            </div>) : null;
    };

    renderLevelOption = (option) => {
        return (<div className="Select-value" title={option.description}>
                    <label className={"d-text-" + option.icon}>{option.description}</label>
            </div>);
    };

    renderLevelValue = (value) => {
        return value ? (<div className="Select-value" title={value.description}>
                <label className={"d-text-" + value.icon}>{value.description}</label>
            </div>) : null;
    };

    renderSource = () => {
        if (this.props.mode === 'ADD') {
            return (<div>
                <Grid fluid>
                    <Row>
                        <Col xs={12}><b><Message msgId="eventeditor.from"/></b></Col>
                    </Row>
                    <Row>
                        <Col xs={4}><label><Message msgId="eventeditor.name"/>:</label></Col>
                        <Col xs={8}><FormControl value={this.props.currentEvent.sourceName || ''} onChange={this.changeSourceName}/></Col>
                    </Row>
                    <Row>
                        <Col xs={4}><label><Message msgId="eventeditor.type"/>:</label></Col>
                        <Col xs={8}><FormControl value={this.props.currentEvent.sourceType || ''} onChange={this.changeSourceType}/></Col>
                    </Row>
                    <Row>
                        <Col xs={4}><label><Message msgId="eventeditor.uri"/>:</label></Col>
                        <Col xs={8}><FormControl value={this.props.currentEvent.sourceUri || ''} onChange={this.changeSourceUri}/></Col>
                    </Row>
                </Grid>
            </div>);
        }
        return <span><b><Message msgId="eventeditor.from"/>:</b> {this.props.currentEvent.sourceName || ''}</span>;
    };

    renderTime = (time) => {
        if (this.props.mode === 'ADD') {
            return [<Col xs={5}><Message msgId={"eventeditor." + time + "time"}/></Col>, <Col xs={7}><DateTimePicker
                value={this.props.currentEvent[time + "time"]}
                time={false}
                onChange={(date) => this.changeTime(time, date)}/></Col>];
        }
        return [<Col xs={5}><Message msgId={"eventeditor." + time + "time"}/></Col>, <Col xs={7}>{this.props.currentEvent[time + "time"]}</Col>];
    };

    renderLocation = () => {
        return (<Col xs={12}>
            <h5><Message msgId="eventeditor.location"/></h5>
            <Grid fluid>
                <Row>
                    <Col xs={10}>
                        <FormControl/>
                    </Col>
                    <Col xs={2}>
                        <Button bsStyle={this.props.drawEnabled ? "primary" : "default"} onClick={this.props.onToggleDraw}><Glyphicon glyph="map-marker"/></Button>
                    </Col>
                </Row>
            </Grid>

        </Col>);
    };

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col xs={4}>{this.renderHazard()}</Col>
                    <Col xs={6}><FormControl placeholder="enter name..." value={this.props.currentEvent.name || ''} onChange={this.changeName}/></Col>
                    <Col xs={2}><Glyphicon glyph="1-close" style={{cursor: "pointer"}} onClick={this.props.onClose}/></Col>
                </Row>
                <Row>
                    <Col xs={12}><Select options={this.props.levels} value={this.props.currentEvent.level}
                        onChange={this.selectLevel} optionRenderer={this.renderLevelOption} valueRenderer={this.renderLevelValue}/></Col>
                </Row>
                <Row>
                    <Col xs={12}>{this.renderSource()}</Col>
                </Row>
                <Row>
                    {this.renderTime('updated')}
                </Row>
                <Row>
                    {this.renderTime('reported')}
                </Row>
                <Row>
                    {this.renderLocation()}
                </Row>
                <Row>
                    <Col xs={12}>
                        <LocationFilter regions={this.props.regions} regionsLoading={this.props.regionsLoading}
                            selectedRegions={this.props.currentEvent.regions || []}
                            loadRegions={this.props.loadRegions}
                            selectRegions={this.selectRegions}
                            title="eventeditor.regions"
                            />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <h5><Message msgId="eventeditor.description"/></h5>
                        <FormControl componentClass="textarea" value={this.props.currentEvent.description || ''} onChange={this.changeDescription}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Button onClick={this.props.onSave}><Message msgId="eventeditor.save"/></Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    changeName = (e) => {
        this.props.onChangeProperty('name', e.target.value);
    };

    changeDescription = (e) => {
        this.props.onChangeProperty('description', e.target.value);
    };

    changeSourceName = (e) => {
        this.props.onChangeProperty('sourceName', e.target.value);
    };

    changeSourceType = (e) => {
        this.props.onChangeProperty('sourceType', e.target.value);
    };

    changeSourceUri = (e) => {
        this.props.onChangeProperty('sourceUri', e.target.value);
    };

    changeTime = (time, value) => {
        this.props.onChangeProperty(time + 'time', value);
    };

    selectHazard = (value) => {
        this.props.onChangeProperty('hazard', value);
    };

    selectLevel = (value) => {
        this.props.onChangeProperty('level', value);
    };

    selectRegions = (regions) => {
        this.props.onChangeProperty('regions', regions);
    };
}

module.exports = EventEditor;
