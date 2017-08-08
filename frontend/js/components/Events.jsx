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
const Card = require('./Card');

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
            <Card key={idx} event={event} hazard={this.getHazard(event.properties.hazard_type)} onToggleVisibility={this.toggleVisibility} isAuthorized={this.props.isAuthorized} onCardClick={this.promote}/>
            ));
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
