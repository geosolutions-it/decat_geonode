/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Grid, Row, Col, Glyphicon} = require('react-bootstrap');
const moment = require('moment');

const PropTypes = require('prop-types');


class Card extends React.Component {
    static propTypes = {
        event: PropTypes.object,
        hazard: PropTypes.string,
        className: PropTypes.string,
        onToggleVisibility: PropTypes.func,
        isAuthorized: PropTypes.func,
        permissionType: PropTypes.string,
        onCardClick: PropTypes.func,
        clickClassName: PropTypes.string,
        height: PropTypes.number.isRequired
    };

    static defaultProps = {
        className: 'd-hazard',
        height: 400,
        clickClassName: "fa fa-paper-plane btn-send",
        permissionType: 'promoteevent',
        isAuthorized: () => (false),
        onCardClick: () => {}
    };
    render() {
        const { className, event, onToggleVisibility, hazard, permissionType, isAuthorized, clickClassName} = this.props;
        const renderCheck = onToggleVisibility && true || false;
        return (
            <Row className={className + ' flex-center'}>
                {renderCheck ? <Col xs={1} className="text-center ">
                    <Glyphicon className="event-check" glyph={event.visible ? 'check' : 'unchecked'} onClick={() => onToggleVisibility(event)}/>
                    </Col> : null}
              <Col xs={1} className="text-center ">
                <h5 className={`fa icon-${hazard} d-text-${event.properties.level} fa-2x`}></h5>
              </Col>
              <Col xs={renderCheck ? 7 : 8}>
                  <Grid fluid>
                    <Row>
                      <Col xs={12}>
                        <h5><strong>{event.properties.title}</strong></h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} className={"d-text-" + event.properties.level}>
                          {event.properties.level}
                      </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="d-text-description">
                          From: <strong>{event.properties.source.name}</strong>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="d-text-description">
                            <div>Reported Time:</div>
                            <div>{moment(event.properties.reported_at).format('YYYY-MM-DD hh:mm:ss A')}</div>
                        </Col>
                    </Row>
                </Grid>
              </Col>
              <Col xs={2} className="text-center">
                  {isAuthorized(permissionType) ? <div className={clickClassName} onClick={this.cardAction}></div> : null}
              </Col>
          </Row>);
    }
    cardAction = () => {
        this.props.onCardClick(this.props.event);
    }
}

module.exports = Card;
