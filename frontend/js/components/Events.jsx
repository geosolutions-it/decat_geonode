/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const {Grid, Row, Col, Glyphicon, FormControl, InputGroup} = require('react-bootstrap');

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
        onEditEvent: PropTypes.func,
        searchInput: PropTypes.string,
        serchedText: PropTypes.string,
        onSearchTextChange: PropTypes.func,
        resetAlertsTextSearch: PropTypes.func,
        loadEvents: PropTypes.func
    };

    static defaultProps = {
        events: [],
        className: 'd-hazard',
        page: 0,
        pageSize: 100,
        total: 100,
        height: 400,
        searchInput: '',
        onAddEvent: () => {},
        onToggleVisibility: () => {},
        isAuthorized: () => (false),
        onSearchTextChange: () => {},
        resetAlertsTextSearch: () => {},
        loadEvents: () => {}
    };

    getHazard = (type) => {
        return AlertsUtils.getHazardIcon(this.props.hazards, type);
    };

    renderCards = () => {
        return this.props.events.map((event, idx) => (

            <Row key={idx} className={this.props.className + ' flex-center'}>
             <Col xs={1} className="text-center ">
               <Glyphicon className="event-check" glyph={event.visible ? 'check' : 'unchecked'} onClick={() => this.toggleVisibility(event)}/>
             </Col>
              <Col xs={1} className="text-center ">
                <h5 className={'fa icon-' + this.getHazard(event.properties.hazard_type) + ' d-text-' + event.properties.level + ' fa-2x'}></h5>
              </Col>
              <Col xs={7}>
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
                  {this.props.isAuthorized('promoteevent') ? <div className="fa fa-paper-plane btn-send" onClick={() => this.promote(event)}></div> : null}
              </Col>

          </Row>));
    };
    render() {
        const {searchInput} = this.props;
        const renderSearch = !searchInput || searchInput.length === 0;
        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Grid fluid>
                            <form >
                                <InputGroup>
                                    <FormControl placeholder="search alert..." value={this.props.searchInput} onChange={this.searchTextChange}
                                        />
                                        <InputGroup.Addon onClick={this.resetText}>
                                        <Glyphicon glyph={renderSearch && "search" || "1-close"}/>
                                    </InputGroup.Addon>
                                    {this.props.isAuthorized('addevent') ? <InputGroup.Addon onClick={this.props.onAddEvent}><Glyphicon glyph="plus" /></InputGroup.Addon> : null}
                                </InputGroup>
                            </form>
                        </Grid>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <div style={{overflow: 'auto', height: this.props.height - (84 + 34) }}>
                                    {this.renderCards()}
                                </div>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} className="text-center">
                            <PaginationToolbar items={this.props.events} pageSize={this.props.pageSize} page={this.props.page} total={this.props.total} onSelect={this.handlePageChange}/>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
    promote = (event) => {
        this.props.onEditEvent(event);
    };

    toggleVisibility = (event) => {
        this.props.onToggleVisibility(event);
    };
    searchTextChange = (e) => {
        this.props.onSearchTextChange(e.target.value);
    }
    resetText = () => {
        if (this.props.searchInput.length > 0) {
            this.props.resetAlertsTextSearch();
        }
    }
    handlePageChange = (page) => {
        this.props.loadEvents(undefined, page);
    }
}

module.exports = Events;
