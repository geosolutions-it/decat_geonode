/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {Grid, Row, Col, ButtonGroup, Button} = require('react-bootstrap');
const PropTypes = require('prop-types');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

class MultiValueFilter extends React.Component {
    static propTypes = {
        entities: PropTypes.array,
        className: PropTypes.string,
        title: PropTypes.string,
        toggleEntity: PropTypes.func,
        toggleEntities: PropTypes.func,
        updateEvents: PropTypes.func
    };

    static defaultProps = {
        entities: [],
        className: 'd-hazard',
        toggleEntity: () => {},
        toggleEntities: () => {},
        updateEvents: () => {}
    }

    renderEntities = () => {
        return this.props.entities.map((entity, idx) => (<div key={idx} className="checkbox">
          <label className={"d-text-" + entity.icon}><input type="checkbox" value={idx} checked={entity.selected} onClick={this.handleClick}/><span className={"fa icon-" + entity.icon}></span>&nbsp;{entity.description}</label>
        </div>));
    }

    render() {
        return (
            <div className={this.props.className}>
                <Grid fluid>
                    <Row>
                        <Col xs="12">
                            <h5><b><Message msgId={this.props.title}/></b></h5>
                            {this.renderEntities()}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="text-center margin-btn-group">
                            <ButtonGroup>
                                <Button disabled={this.allSelected()} bsSize="xs" onClick={this.selectAll}><Message msgId="multivalue.selectall"/></Button>
                                <Button disabled={this.noneSelected()} bsSize="xs" onClick={this.selectNone}><Message msgId="multivalue.deselectall"/></Button>
                                <Button bsSize="xs" onClick={this.props.updateEvents}><Message msgId="multivalue.update"/></Button>
                              </ButtonGroup>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
    handleClick = (v) => {
        this.props.toggleEntity(parseInt(v.target.value, 10), v.target.checked);
    }
    selectAll = () => {
        this.props.toggleEntities(true);
    }
    selectNone = () => {
        this.props.toggleEntities(false);
    }
    allSelected = () => {
        return (this.props.entities || []).filter((e) => {return !e.selected; }).length === 0;
    }
    noneSelected = () => {
        return (this.props.entities || []).filter((e) => {return e.selected; }).length === 0;
    }
}

module.exports = MultiValueFilter;
