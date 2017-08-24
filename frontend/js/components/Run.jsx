/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Grid, Row, Col} = require('react-bootstrap');
const moment = require('moment');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const PropTypes = require('prop-types');
const {head} = require('lodash');

class Run extends React.Component {
    static propTypes = {
        run: PropTypes.object,
        onUpload: PropTypes.func,
        runnable: PropTypes.bool
    };

    static defaultProps = {
        onUpload: () => {},
        runnable: false
    };
    state = {
        collapsed: true
    };
    renderDocs = (doc) => {
        return (
            <Row className="row-eq-height">
                <Col xs={10}>{doc.label}</Col>
                <Col xs={2}>
                    <div className="btn-group pull-right">
                        <div className={`dect-btn glyphicon glyphicon-plus ${doc.uploaded && 'dect-disabled' || 'btn-hover'}`} onClick={() => this.addDoc(doc)}></div>
                    </div>
                </Col>
            </Row>);
    }
    renderLayer = (layer) => {
        const {runnable} = this.props;
        return (
            <Row className="row-eq-height">
                <Col xs={10}>{layer.label}</Col>
                <Col xs={2}>
                    <div className="pull-right">
                        <div className={`dect-btn glyphicon glyphicon-plus ${layer.uploaded && 'btn-hover' || 'dect-disabled'}`} onClick={() => this.addLayer(layer)}></div>
                        <div className={`fa fa-pencil ${runnable || !layer.uploaded && 'dect-disabled' || 'btn-hover'}`} onClick={() => this.handleEdit(layer)}></div>
                    </div>
                </Col>
            </Row>);
    }
    renderOutputs= (outputs = []) => {
        return outputs.map((o, idx) => {
            return (
                <div key={idx} className="d-hazard">
                    <div className="container-fluid">
                        {o.type === 'gn_layer' && this.renderLayer(o) || this.renderDocs(o)}
                    </div>
                </div>);
        });
    }
    renderInputs= (inputs = []) => {
        return inputs.map((i, idx) => {
            return (
                <li key={idx} className="list-group-item run-input">
                    <span className="hazard-info-label">
                        {i.label}
                    </span>
                    {i.data}
                </li>);
        });
    }
    renderBody = () => {
        const {run} = this.props;
        const p = run.properties || {};
        return (
            <Col xs={12}>
                <div style={{paddingTop: 10}}><strong>Output</strong></div>
                {this.renderOutputs(p.outputs)}
                <div className="d-top-border" style={{paddingTop: 10, marginTop: 20}}><strong>Input</strong></div>
                <Row>
                    <Col xs={12} style={{padding: 0}}>
                        <ul className="list-group"> {this.renderInputs(p.inputs)} </ul>

                    </Col>
                </Row>

            </Col>);
    }
    render() {
        const {run, runnable} = this.props;
        const {title, created_at: created, outputs= []} = run.properties || {};
        const isUploaded = head(outputs.filter(o => !o.uploaded)) ? false : true;
        return (
            <Row key={run.id} className="d-hazard" style={{margin: "10px 15px", paddingRight: 1}}>
                <Row key={run.id} className="flex-center">
                    <Col xs={10}>
                      <Grid fluid>
                        <Row>
                          <Col xs={12}>
                            <h5><strong>{title}</strong></h5>
                          </Col>
                        </Row>
                        <Row>
                            <Col xs={12} className="d-text-description">
                                <Message msgId="decatassessment.created_at"/>
                                <div>{moment(created).format('YYYY-MM-DD hh:mm:ss A')}</div>
                            </Col>
                        </Row>
                    </Grid>
                  </Col>
                  <Col xs={1} className="text-center">
                      <div className={`dect-btn glyphicon glyphicon-upload d-icon-rotete ${(runnable || isUploaded) && 'dect-disabled' || 'btn-hover'}`} onClick={this.handleUpload}></div>
                  </Col>
                  <Col xs={1} className="text-center">
                      <div className={`dect-btnglyphicon glyphicon-chevron-${this.state.collapsed && 'left' || 'down'} d-icon-rotete btn-hover`} onClick={this.toggle}></div>
                  </Col>
              </Row>
              <Row className={`flex-center collapse ${this.state.collapsed && 'hidden' || ''}`}>
                  {this.renderBody()}
              </Row>
          </Row>);
    }
    handleUpload = () => {
        const {runnable, onUpload, run} = this.props;
        const {outputs = []} = run.properties;
        const isUploaded = head(outputs.filter(o => !o.uploaded)) ? false : true;
        if (!runnable && !isUploaded) {
            onUpload(run);
        }
    }
    toggle = () => {
        this.setState({collapsed: !this.state.collapsed});
    }
    addLayer = (l) => {
        console.log("TODO::// add layer", l);
    }
    addDoc = (d) => {
        console.log("TODO::// add doc", d);
    }
    handleEdit = (l) => {
        console.log("TODO::// GoTo edit layer", l);
    }
}

module.exports = Run;
