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
const {head} = require('lodash');
require('react-select/dist/react-select.css');

class LocationFilter extends React.Component {
    static propTypes = {
        regions: PropTypes.object,
        className: PropTypes.string,
        title: PropTypes.string,
        placeholder: PropTypes.string,
        loadRegions: PropTypes.func,
        selectRegions: PropTypes.func,
        selectedRegions: PropTypes.array,
        url: PropTypes.string,
        regionsLoading: PropTypes.bool,
        onUpdate: PropTypes.func
    };
    static defaultProps = {
        regions: {},
        className: 'd-hazard',
        placeholder: 'search location...',
        loadRegions: () => {},
        selectRegions: () => {},
        url: "/decat/api/regions",
        regionsLoading: false,
        selectedRegions: []
    };
    getAllRegions = () => {
        return (this.props.regions.results || []).concat(this.props.selectedRegions || []);
    };
    getOptions = () => {
        return this.getAllRegions().map((region) => ({
            value: region.code,
            label: region.name
        }));
    }
    render() {
        const values = (this.props.selectedRegions || []).map((reg) => reg.code).join();
        return (
            <div className={this.props.className}>
                <Grid fluid>
                    <Row>
                        <Col xs={12}>
                            <h5><strong><Message msgId={this.props.title}/></strong></h5>
                            <Select options={this.getOptions()} name="location" multi simpleValue value={values} placeholder={this.props.placeholder}
                                onInputChange={this.handleRegionInputChange}
                                onChange={this.handleChange} onMenuScrollToBottom={this.handlePageChange} isLoading={this.props.regionsLoading} onClose={this.handleClose}/>
                        </Col>
                    </Row>
                    {this.props.onUpdate ? <Row>
                        <Col xs={12} className="text-center margin-btn-group">
                            <ButtonGroup>
                                <Button bsSize="xs" onClick={this.props.onUpdate}><Message msgId="multivalue.update"/></Button>
                            </ButtonGroup>
                        </Col>
                    </Row> : null}
                </Grid>
            </div>
        );
    }
    handlePageChange = () => {
        const {loadRegions, regions = {}, url} = this.props;
        if (regions.next) {
            loadRegions(url, true);
        }
    };
    handleRegionInputChange = (value) => {
        const {loadRegions, url} = this.props;
        loadRegions(url, false, value);
    };
    handleChange = (value) => {
        const results = this.getAllRegions();
        const values = value.split(',').map((val) => head(results.filter( o => o.code === val))).filter((reg) => reg);
        this.props.selectRegions(values);
    };
    handleClose = () => {
        const {loadRegions, url} = this.props;
        loadRegions(url, false);
    };
}

module.exports = LocationFilter;
