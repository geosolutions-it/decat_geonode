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
        title: PropTypes.string
    };

    static defaultProps = {
        entities: [],
        className: 'd-hazard'
    };

    renderEntities = () => {
        return this.props.entities.map((entity) => (<div className="checkbox">
          <label className={"d-text-" + entity.icon}><input type="checkbox" value="" checked={entity.selected}/><span className={"fa d-text-" + entity.icon}></span>&nbsp;{entity.description}</label>
        </div>));
    };

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
                                <Button bsSize="xs"><Message msgId="multivalue.selectall"/></Button>
                                <Button bsSize="xs"><Message msgId="multivalue.deselectall"/></Button>
                                <Button bsSize="xs"><Message msgId="multivalue.update"/></Button>
                              </ButtonGroup>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
}

module.exports = MultiValueFilter;
