/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const PropTypes = require('prop-types');

const PaginationToolbar = require('../../MapStore2/web/client/components/misc/PaginationToolbar');

class Events extends React.Component {
    static propTypes = {
        events: PropTypes.array,
        className: PropTypes.string,
        page: PropTypes.number,
        pageSize: PropTypes.number,
        total: PropTypes.number
    };

    static defaultProps = {
        events: [],
        className: 'd-hazard',
        page: 0,
        pageSize: 100,
        total: 100
    };

    renderCards = () => {
        return this.props.events.map((event) => (
            <Row className="row-eq-height">
              <Col xs="1" className="text-center ">

                <div className="checkbox">
                  <label><input type="checkbox" value=""/></label>
                </div>

              </Col>
              <Col xs="2" className="text-center ">
                <h5 className="fa icon-eq fa-3x d-text-warning"></h5>
              </Col>
              <Col xs="7">
                  <Grid fluid>
                    <Row>
                      <Col xs="12">
                        <h5><b>{event.properties.title}</b></h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs="12" className="d-text-warning">
                          {event.properties.level}
                      </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="text-description">
                          From: {event.properties.source.name}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="text-description">
                            Reported Time: {event.properties.reported_at}
                        </Col>
                    </Row>
                </Grid>

              </Col>
              <Col xs="2" className="text-center">
                <div className="btn btn-default d-no-border" side-left="side-left-1" side-right="side-hazard">
                  <i className="fa fa-paper-plane"></i>
                </div>
              </Col>

          </Row>));
    };

    render() {
        return (
            <div>
                <Grid fluid>
                    <Row>
                        <form lpformnum="2">
                            <div className="input-group">
                              <input type="text" className="form-control" placeholder="search alert..."/>
                              <div className="input-group-btn">
                                <button className="btn btn-default" type="submit">
                                    <i className="fa fa-search"></i>
                                </button>
                              </div>
                            </div>
                          </form>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <div className="row d-impact-table-container">
                                <Grid fluid>
                                    <div className={this.props.className}>
                                        {this.renderCards()}
                                    </div>
                                </Grid>
                          </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12">
                            <PaginationToolbar items={this.props.events} pageSize={this.props.pageSize} page={this.props.page} total={this.props.total}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

module.exports = Events;
