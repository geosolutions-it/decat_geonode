/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Grid, Row, Col, Panel, ButtonGroup, Button} = require('react-bootstrap');
const moment = require('moment');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const PropTypes = require('prop-types');
const AlertsUtils = require('../utils/AlertsUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const PaginationToolbar = require('../../MapStore2/web/client/components/misc/PaginationToolbar');

class Hazard extends React.Component {
   static propTypes = {
          className: PropTypes.string,
          mode: PropTypes.oneOf(["HAZARD"]),
          height: PropTypes.number,
          currentHazard: PropTypes.object,
          hazards: PropTypes.array,
          levels: PropTypes.array,
          onSave: PropTypes.func,
          onChangeProperty: PropTypes.func,
          onClose: PropTypes.func,
          status: PropTypes.object,
          sourceTypes: PropTypes.array,
          event: PropTypes.object,
          pageSize: PropTypes.number,
          assessments: PropTypes.array,
          page: PropTypes.number,
          total: PropTypes.number

      };

      static contextTypes = {
          messages: PropTypes.object
      };

      static defaultProps = {
          className: 'd-hazard',
          pageSize: 10,
          page: 0,
          total: 0,
          assessments: [],
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
                    <Col xs={1}>
                    <h5 className="glyphicon glyphicon-1-close close-hazard-icon" onClick={this.props.onClose}></h5>
                     </Col>
                </Row>
            </Grid>
            );
    }
    renderAssessment = () => {
        const {assessments = [], currentHazard} = this.props;
        return assessments.map((ass, idx) => {
            return (
                  <Row key={idx} className={`d-hazard flex-center`}>
                    <Col xs={1} className="text-center ">
                      <h5 className={`glyphicon glyphicon-1-map d-text-${currentHazard.properties.level}`}></h5>
                    </Col>
                    <Col xs={8}>
                        <Grid fluid>
                          <Row>
                            <Col xs={12}>
                              <h5><strong>{ass.title}</strong></h5>
                            </Col>
                          </Row>
                          <Row>
                              <Col xs={12} className="d-text-description">
                                  <Message msgId="decatassessment.created_at"/>
                                  <div>{moment(ass.date).format('YYYY-MM-DD hh:mm:ss A')}</div>
                              </Col>
                          </Row>
                      </Grid>
                    </Col>
                    <Col xs={2} className="text-center">
                        <div className="fa fa-pencil" onClick={() => {}}></div>
                    </Col>
                </Row>
                );
        });
    }
    renderBody = () => {
        const { level, updated_at, reported_at, source, description} = this.props && this.props.currentHazard && this.props.currentHazard.properties || {};
        return (
            <Grid fluid>
                <div style={{overflow: 'auto', height: this.props.height - (30 + 40 + 60 + 132 )}}>
                    <Row className="hazard-info">
                        <Panel header={LocaleUtils.getMessageById(this.context.messages, "decatassessment.hazardinfo")} eventKey="1" collapsible>
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
                        <Col xs={12} className="text-center">Saved Assesments</Col>
                    </Row>
                    {this.renderAssessment()}
                </div>
            </Grid>
            );
    }
    render() {
        const { assessments, pageSize, page, total, height, onClose} = this.props || {};
        return (
            <div className="hazard-container" style={{overflow: 'auto', height: height - 30}}>
                {this.renderHeader()}
                {this.renderBody()}
                <Grid fluid>
                    <Row>
                        <Col xs={12} className="text-center">
                        <PaginationToolbar items={assessments} pageSize={pageSize} page={page} total={total} onSelect={() => {}}/>
                    </Col>
                    </Row>
                    <Row>
                        <Col className="text-center" xs={12}>
                            <ButtonGroup className="event-editor-bottom-group">
                                <Button bsSize="sm" onClick={onClose}><Message msgId="eventeditor.cancel"/></Button>
                                <Button bsSize="sm" onClick={() => {}}><Message msgId="decatassessment.add"/></Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Grid>
            </div>);
    }
}

module.exports = Hazard;
