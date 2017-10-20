/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Grid, Row, Col, Panel, Button} = require('react-bootstrap');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const PropTypes = require('prop-types');
// const AlertsUtils = require('../utils/AlertsUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const AlertsUtils = require('../utils/AlertsUtils');
const moment = require('moment');

class EditCop extends React.Component {
    static propTypes = {
          className: PropTypes.string,
          height: PropTypes.number,
          currentHazard: PropTypes.object,
          hazards: PropTypes.array,
          onSave: PropTypes.func,
          pageSize: PropTypes.number,
          assessments: PropTypes.array,
          cancelAddAssessment: PropTypes.func,
          accordionHeight: PropTypes.number,
          toggleAnnotations: PropTypes.func
      };

      static contextTypes = {
          messages: PropTypes.object
      };
      static defaultProps = {
          className: 'd-hazard',
          onSave: () => {},
          cancelAddAssessment: () => {},
          currentHazard: {},
          height: 400,
          toggleAnnotations: () => {}
      };
    state = {
        showConfirm: false
    }
    getHazard = (type) => {
        return AlertsUtils.getHazardIcon(this.props.hazards, type);
    }
    getPoint = () => {
        const {coordinates: point} = this.props.currentHazard && this.props.currentHazard.geometry;
        if (point) {
            let latDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};
            let lngDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};

            return new Intl.NumberFormat(undefined, latDFormat).format(Math.abs(point[1])) + '°' + (Math.sign(point[1]) >= 0 ? 'N' : 'S') + ' ' +
                new Intl.NumberFormat(undefined, lngDFormat).format(Math.abs(point[0])) + '°' + (Math.sign(
                    point[0]) >= 0 ? 'E' : 'W');
        }
        return '';
    }
    renderHeader = () => {
        const {hazard_type, level, title} = this.props && this.props.currentHazard && this.props.currentHazard.properties || {};
        return (
            <Grid fluid>
                <Row style={{height: 56}}>
                    <Col xs={2} className="text-center">
                        <h5 className={`fa icon-${this.getHazard(hazard_type)} d-text-${level} fa-2x`}></h5>
                    </Col>
                    <Col xs={8} className="text-center" >
                    <h4>{title}</h4>
                    </Col>
                    <Col xs={1}/>
                </Row>
            </Grid>
            );
    }
    renderBody = () => {
        const { level, updated_at, reported_at, source, description} = this.props && this.props.currentHazard && this.props.currentHazard.properties || {};
        return (
            <Grid fluid>
                <div style={{overflow: 'auto', height: this.props.height - (30 + 40 + 60 + 132 )}}>
                    <Row className="hazard-info">
                        <Panel header={LocaleUtils.getMessageById(this.context.messages, "decatassessment.hazardinfo")} eventKey="1" collapsible expanded>
                            <Row className="text-center">
                                <Col xs={12} className={`d-text-${level}`}>{level}</Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <span className="hazard-info-label"><Message msgId="eventeditor.from"/></span>
                                    {source && source.name}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <span className="hazard-info-label"><Message msgId="eventeditor.updatedtime"/></span>
                                    {moment(updated_at).format('YYYY-MM-DD hh:mm:ss A')}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12}>
                                    <span className="hazard-info-label"><Message msgId="eventeditor.reportedtime"/></span>
                                    {moment(reported_at).format('YYYY-MM-DD hh:mm:ss A')}
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} ><span className="hazard-info-label"><Message msgId="eventeditor.location"/></span>{this.getPoint()}</Col>
                            </Row>
                            <Row>
                                <Col xs={12} ><span className="hazard-info-label"><Message msgId="eventeditor.description"/></span>
                                    <Row className="hazard-info-description"><Col xs={12}>{description}</Col></Row>
                                </Col>
                            </Row>

                        </Panel>
                    </Row>
                    <Row>
                        <Col xs={12} className="text-center">
                            <Button onClick={() => { this.props.toggleAnnotations(); }} bsSize="sm">Annotations</Button>
                        </Col>
                    </Row>
                </div>
            </Grid>
            );
    }
    render() {
        const {height} = this.props;
        return (
            <div id="decat-impact-assessment" key="decat-impact-assessment" style={{height: height - 20}} >
                <div className="hazard-container" style={{overflow: 'auto', height: height - 30}}>
                {this.renderHeader()}
                {this.renderBody()}
                </div>
                <div style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', position: 'absolute', top: height - 80, width: "100%"}}>
                    <div className="text-center">
                        <Button bsSize="sm" onClick={this.handleCancel}><Message msgId="eventeditor.cancel"/></Button>
                    </div>
                </div>
                {this.state.showConfirm ? <Portal>
                            <ConfirmDialog onConfirm={this.handleConfirm} onClose={this.handleClose} show={this.state.showConfirm} title={<Message msgId="decatassessment.addnewassessmentTitle" />} >
                                <Message msgId="decatmanager.closecop"/>
                            </ConfirmDialog>
                        </Portal> : null}
            </div>);
    }
    handleCancel = () => {
        this.setState({ showConfirm: true});
    }
    handleClose = () => {
        this.setState({ showConfirm: false});
    }
    handleConfirm = () => {
        this.setState({ showConfirm: false});
        this.props.cancelAddAssessment();
    }
}

module.exports = EditCop;
