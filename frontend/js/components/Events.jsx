/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col, Glyphicon, Button, Checkbox} = require('react-bootstrap');
const PropTypes = require('prop-types');
const AlertsUtils = require('../utils/AlertsUtils');

const PaginationToolbar = require('../../MapStore2/web/client/components/misc/PaginationToolbar');

const moment = require('moment');

class Events extends React.Component {
    static propTypes = {
        events: PropTypes.array,
        hazards: PropTypes.array,
        className: PropTypes.string,
        page: PropTypes.number,
        pageSize: PropTypes.number,
        total: PropTypes.number,
        height: PropTypes.number,
        onAddEvent: PropTypes.func,
        isAuthorized: PropTypes.func,
        onToggleVisibility: PropTypes.func,
        onPromote: PropTypes.func
    };

    static defaultProps = {
        events: [],
        className: 'd-hazard',
        page: 0,
        pageSize: 100,
        total: 100,
        height: 400,
        onAddEvent: () => {},
        onToggleVisibility: () => {},
        isAuthorized: () => (false)
    };

    getHazard = (type) => {
        return AlertsUtils.getHazardIcon(this.props.hazards, type);
    };

    renderCards = () => {
        return this.props.events.map((event) => (

            <Row className={this.props.className + ' flex-center'}>
             <Col xs="1" className="text-center ">
               <Checkbox value={event.visible || false} onChange={() => this.toggleVisibility(event)}/>
             </Col>
              <Col xs="1" className="text-center ">
                <h5 className={'fa icon-' + this.getHazard(event.properties.hazard_type) + ' d-text-' + event.properties.level + ' fa-2x'}></h5>
              </Col>
              <Col xs="7">
                  <Grid fluid>
                    <Row>
                      <Col xs="12">
                        <h5><strong>{event.properties.title}</strong></h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="12" className={"d-text-" + event.properties.level}>
                          {event.properties.level}
                      </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="d-text-description">
                          From: {event.properties.source.name}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="d-text-description">
                            Reported Time: {moment(event.properties.reported_at).format('YYYY-MM-DD hh:mm:ss')}
                        </Col>
                    </Row>
                </Grid>

              </Col>
              <Col xs="2" className="text-center">
                  {this.props.isAuthorized('promoteevent') ? <div className="fa fa-paper-plane btn-send" onClick={() => this.promote(event)}></div> : null}
              </Col>

          </Row>));
    };

    render() {
        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Grid fluid>
                            <form lpformnum="2">
                                <div className="input-group">
                                    <input type="text" className="form-control" placeholder="search alert..."/>
                                    <div className="input-group-btn">
                                        <Button><Glyphicon glyph="search"/></Button>
                                        {this.props.isAuthorized('addevent') ? <Button onClick={this.props.onAddEvent} bsSize="xlarge"><Glyphicon glyph="plus"/></Button> : null}
                                    </div>
                                </div>
                            </form>
                        </Grid>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <Row>
                                <div style={{overflow: 'auto', height: this.props.height - (84 + 34) }}>
                                    {this.renderCards()}
                                </div>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="text-center">
                            <PaginationToolbar items={this.props.events} pageSize={this.props.pageSize} page={this.props.page} total={this.props.total}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }

    promote = (event) => {
        this.props.onPromote(event);
    };

    toggleVisibility = (event) => {
        this.props.onToggleVisibility(event);
    };
}

module.exports = Events;
