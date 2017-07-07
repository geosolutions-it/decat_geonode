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
const Select = require('react-select');

require('react-select/dist/react-select.css');

class LocationFilter extends React.Component {
    static propTypes = {
        regions: PropTypes.array,
        className: PropTypes.string,
        title: PropTypes.string,
        placeholder: PropTypes.string
    };

    static defaultProps = {
        regions: [],
        className: 'd-hazard',
        placeholder: 'search location...'
    };

    state = {
        value: null
    };

    getOptions = () => {
        return this.props.regions.map((region) => ({
            value: region.code,
            label: region.name
        }));
    };

    render() {
        return (
            <div className={this.props.className}>
                <Grid fluid>
                    <Row>
                        <Col xs="12">
                            <h5><b><Message msgId={this.props.title}/></b></h5>
                            <Select options={this.getOptions()} name="location" multi simpleValue value={this.state.value} placeholder={this.props.placeholder}
                                onChange={this.handleChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="12" className="text-center margin-btn-group">
                            <ButtonGroup>
                                <Button bsSize="xs"><Message msgId="multivalue.update"/></Button>
                            </ButtonGroup>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }

    handleChange = (value) => {
        this.setState({
            value
        });
    };
}

module.exports = LocationFilter;
