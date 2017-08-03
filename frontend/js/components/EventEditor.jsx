/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col, Glyphicon, FormControl, Button, ButtonGroup, OverlayTrigger, Tooltip, Alert} = require('react-bootstrap');
const PropTypes = require('prop-types');
const AlertsUtils = require('../utils/AlertsUtils');
const Select = require('react-select');

const Message = require('../../MapStore2/web/client/components/I18N/Message');
const {DateTimePicker} = require('react-widgets');

const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');

const moment = require('moment');

/*const LocationFilter = connect((state) => ({
        regions: state.alerts && state.alerts.regions || {},
        regionsLoading: state.alerts && state.alerts.regionsLoading || false,
        selectedRegions: state.alerts && state.alerts.selectedRegions || []
 }), {loadRegions, selectRegions})(require('../components/LocationFilter'));*/

const LocationFilter = require('../components/LocationFilter');

class EventEditor extends React.Component {
    static propTypes = {
        className: PropTypes.string,
        mode: PropTypes.oneOf(["ADD", "LIST"]),
        height: PropTypes.number,
        currentEvent: PropTypes.object,
        hazards: PropTypes.array,
        levels: PropTypes.array,
        onSave: PropTypes.func,
        onChangeProperty: PropTypes.func,
        loadRegions: PropTypes.func,
        regions: PropTypes.object,
        regionsLoading: PropTypes.bool,
        selectedRegions: PropTypes.array,
        drawEnabled: PropTypes.bool,
        onToggleDraw: PropTypes.func,
        onClose: PropTypes.func,
        status: PropTypes.object,
        sourceTypes: PropTypes.array
    };

    static contextTypes = {
        messages: PropTypes.object
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
        height: 400,
        regions: [],
        sourceTypes: [],
        regionsLoading: false,
        drawEnabled: false,
        status: {
            saving: false,
            saveError: null
        }
    };

    getPoint = () => {
        if (this.props.currentEvent.point) {
            let latDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};
            let lngDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};

            return new Intl.NumberFormat(undefined, latDFormat).format(Math.abs(this.props.currentEvent.point.lat)) + '°' + (Math.sign(this.props.currentEvent.point.lat) >= 0 ? 'N' : 'S') + ' ' +
                new Intl.NumberFormat(undefined, lngDFormat).format(Math.abs(this.props.currentEvent.point.lng)) + '°' + (Math.sign(this.props.currentEvent.point.lng) >= 0 ? 'E' : 'W');
        }
        return '';
    };

    renderHazard = () => {
        if (this.props.mode === 'ADD') {
            return <Select placeholder={LocaleUtils.getMessageById(this.context.messages, "eventeditor.hazardholder")} options={this.props.hazards} value={this.props.currentEvent.hazard} onChange={this.selectHazard} optionRenderer={this.renderHazardOption} valueRenderer={this.renderHazardValue}/>;
        }
        return <h5 className={"fa icon-" + this.props.currentEvent.hazard.icon}>{this.props.currentEvent.hazard.description}</h5>;
    };

    renderHazardOption = (option) => {
        return (<div className="Select-value" title={option.description}>
                <span className="Select-value-label">
                    <span className={"fa icon-" + option.icon}>&nbsp;{option.name}</span>
                </span>
            </div>);
    };

    renderHazardValue = (value) => {
        return value ? (<div className="Select-value" title={value.description}>
                <span className="Select-value-label">
                    <span className={"fa icon-" + value.icon}>&nbsp;{value.name}</span>
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
            return (
                <div>
                    <Row>
                        <Col className="event-editor-divider" xs={12}><strong><Message msgId="eventeditor.from"/></strong></Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <div><Message msgId="eventeditor.name"/>:</div>
                        </Col>
                        <Col xs={6}>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="eventeditor-name"><Message msgId="eventeditor.namedescription"/></Tooltip>}>
                                <Glyphicon className="pull-right" glyph="question-sign"/>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <FormControl value={this.props.currentEvent.sourceName || ''} onChange={this.changeSourceName}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <div><Message msgId="eventeditor.type"/>:</div>
                        </Col>
                        <Col xs={6}>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="eventeditor-type"><Message msgId="eventeditor.typedescription"/></Tooltip>}>
                                <Glyphicon className="pull-right" glyph="question-sign"/>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Select options={this.props.sourceTypes.map((type) => ({
                                    label: type.name,
                                    value: type.name
                                }))} value={this.props.currentEvent.sourceType || ''} onChange={this.changeSourceType}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={6}>
                            <div><Message msgId="eventeditor.uri"/>:</div>
                        </Col>
                        <Col xs={6}>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="eventeditor-uri"><Message msgId="eventeditor.uridescription"/></Tooltip>}>
                                <Glyphicon className="pull-right" glyph="question-sign"/>
                            </OverlayTrigger>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <FormControl value={this.props.currentEvent.sourceUri || ''} onChange={this.changeSourceUri}/>
                        </Col>
                    </Row>
                </div>
            );
        }
        return (<div>
            <Row>
                <Col className="event-editor-divider" xs={12}>
                    <strong><Message msgId="eventeditor.from"/>:</strong>
                </Col>
                <Col xs={12}>
                    <div className="pull-right">{this.props.currentEvent.sourceName || ''}</div>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <div><Message msgId="eventeditor.uri"/>:</div>
                </Col>
                <Col xs={6}>
                    <OverlayTrigger placement="top" overlay={<Tooltip id="eventeditor-uri"><Message msgId="eventeditor.uridescription"/></Tooltip>}>
                        <Glyphicon className="pull-right" glyph="question-sign"/>
                    </OverlayTrigger>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <FormControl value={this.props.currentEvent.sourceUri || ''} onChange={this.changeSourceUri}/>
                </Col>
            </Row>
        </div>);
    };

    renderTime = (time) => {
        if (this.props.mode === 'ADD') {
            return (<Col xs={12}><Message msgId={"eventeditor." + time + "time"}/><DateTimePicker
                value={this.props.currentEvent[time + "time"]}
                time={false}
                onChange={(date) => this.changeTime(time, date)}/></Col>);
        }
        return [<Col xs={5}><Message msgId={"eventeditor." + time + "time"}/></Col>, <Col xs={7}>{this.props.currentEvent[time + "time"]}</Col>];
    };

    renderLocation = () => {
        return (<div>
            <Row>
                <Col xs={12}>
                    <Message msgId="eventeditor.coordinates"/>
                </Col>
            </Row>
            <Grid fluid>
                <Row>
                    <Col xs={12}>
                        <div className="input-group">
                        <FormControl disabled value={this.getPoint()}/>
                        <div className="input-group-btn">
                            <Button active={this.props.drawEnabled} onClick={this.props.onToggleDraw}><Glyphicon glyph="map-marker"/></Button>
                        </div>
                        </div>
                    </Col>
                </Row>
            </Grid>
        </div>);
    }
    renderSaveError = () => {
        if (this.props.status.saveError) {
            return (<Row><Col xs={12}>
                <Alert bsStyle="danger">
                    <h4>
                        <Message msgId="eventeditor.saveerror"/>
                    </h4>
                    {this.formatError(this.props.status.saveError.data)}
                </Alert>
            </Col></Row>);
        }
        return null;
    };

    renderTimes = () => {
        return this.props.mode === 'ADD' ? null : (<div>
            <Row>
                <Col className="event-editor-divider" xs={12}><strong><Message msgId="eventeditor.location"/></strong></Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <Message msgId="eventeditor.updatedtime"/>:
                </Col>
                <Col xs={12}>
                    <div className="pull-right">{moment(this.props.currentEvent.updated).format('YYYY-MM-DD hh:mm:ss A')}</div>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <Message msgId="eventeditor.reportedtime"/>:
                </Col>
                <Col xs={12}>
                    <div className="pull-right">{moment(this.props.currentEvent.repoerted).format('YYYY-MM-DD hh:mm:ss A')}</div>
                </Col>
            </Row>
        </div>);
    };

    render() {
        return (<div>
            <div className="event-editor-container" style={{overflow: 'auto', height: this.props.height - 34 }}>
                <Grid fluid>
                    {/*
                    <Row >
                        <Col xs={2}><Glyphicon glyph="1-close" style={{cursor: "pointer"}} onClick={this.props.onClose}/></Col>
                        <Col xs={10}/>
                    </Row>
                    */}
                    <Row>
                        <Col xs={12} className="text-center"><h4><Message msgId={this.props.mode === 'ADD' ? "eventeditor.createalert" : "eventeditor.promotealert"}/></h4></Col>
                    </Row>
                    {this.renderSaveError()}
                    <Row>
                        <Col xs={12}><strong><Message msgId="eventeditor.alertinfo"/></strong></Col>
                    </Row>
                    <Row>
                        <Col xs={12}><FormControl className="text-center" placeholder={LocaleUtils.getMessageById(this.context.messages, "eventeditor.nameholder")} value={this.props.currentEvent.name || ''} onChange={this.changeName}/></Col>
                    </Row>
                    <Row className="text-center">
                        <Col xs={12}>{this.renderHazard()}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="text-center">
                            <Select
                                options={this.props.levels}
                                placeholder={LocaleUtils.getMessageById(this.context.messages, "eventeditor.levelholder")}
                                value={this.props.currentEvent.level}
                                onChange={this.selectLevel}
                                optionRenderer={this.renderLevelOption}
                                valueRenderer={this.renderLevelValue}/>
                        </Col>
                    </Row>
                    {/*
                    <Row>
                        <Col className="event-editor-divider" xs={12}><strong>Hazard time</strong></Col>
                    </Row>
                    <Row>
                        {this.renderTime('updated')}
                    </Row>
                    <Row>
                        {this.renderTime('reported')}
                    </Row>
                    */}
                    <Row>
                        <Col className="event-editor-divider" xs={12}><strong><Message msgId="eventeditor.location"/></strong></Col>
                    </Row>
                    {this.renderLocation()}
                    <LocationFilter regions={this.props.regions}
                        regionsLoading={this.props.regionsLoading}
                        selectedRegions={this.props.currentEvent.regions || []}
                        loadRegions={this.props.loadRegions}
                        selectRegions={this.selectRegions}
                        title="eventeditor.regions"
                        placeholder={LocaleUtils.getMessageById(this.context.messages, "eventeditor.regionsholder")}
                        />
                    {this.renderTimes()}
                    {this.renderSource()}
                    <Row>
                        <Col className="event-editor-divider" xs={12}>
                            <strong><Message msgId="eventeditor.description"/></strong>
                            <FormControl componentClass="textarea" value={this.props.currentEvent.description || ''} onChange={this.changeDescription}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
            <Grid fluid>
                <Row>
                    <Col className="text-center" xs={12}>
                        <ButtonGroup className="event-editor-bottom-group">
                            <Button bsSize="sm" onClick={this.props.onClose}><Message msgId="eventeditor.cancel"/></Button>
                            <Button disabled={this.props.status.saving} bsSize="sm" onClick={this.save}><Message msgId="eventeditor.save"/></Button>
                            {this.props.mode === 'ADD' ? null : <Button disabled={this.props.status.saving} bsSize="sm" onClick={this.promote}><Message msgId="eventeditor.promote"/></Button>}
                            {this.props.mode === 'ADD' ? null : <Button disabled={this.props.status.saving} bsSize="sm" onClick={this.archive}><Message msgId="eventeditor.archive"/></Button>}
                        </ButtonGroup>
                    </Col>
                </Row>
            </Grid>
        </div>
        );
    }

    promote = () => {
        this.props.onSave("PROMOTE", true);
    };
    archive = () => {
        this.props.onSave("ARCHIVE", false, true);
    };
    save = () => {
        this.props.onSave(this.props.mode === 'LIST' && 'UPDATE' || this.props.mode, false);
    };

    changeName = (e) => {
        this.props.onChangeProperty('name', e.target.value);
    };

    changeDescription = (e) => {
        this.props.onChangeProperty('description', e.target.value);
    };

    changeSourceName = (e) => {
        this.props.onChangeProperty('sourceName', e.target.value);
    };

    changeSourceType = (option) => {
        this.props.onChangeProperty('sourceType', option.value);
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

    formatError= (errors) => {
        return AlertsUtils.flatErrors(errors || {}).map((e, idx) =>
            (<p key={idx}><span className="alertsErrorTitle">{e.title}</span><span className="alertsErrorContent">{e.text}</span></p>));
    }
}

module.exports = EventEditor;
