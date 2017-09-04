/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Grid, Row, Col, Alert} = require('react-bootstrap');
const moment = require('moment');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const PropTypes = require('prop-types');
const {head} = require('lodash');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const Spinner = require('react-spinkit');

class Run extends React.Component {
    static propTypes = {
        run: PropTypes.object,
        onUpload: PropTypes.func,
        runnable: PropTypes.bool,
        addRunLayer: PropTypes.func,
        editLayer: PropTypes.func,
        addReport: PropTypes.func,
        layers: PropTypes.array,
        documents: PropTypes.array,
        runBrgm: PropTypes.func
    };

    static defaultProps = {
        onUpload: () => {},
        addRunLayer: () => {},
        addReport: () => {},
        runBrgm: () => {},
        runnable: false,
        layers: [],
        documents: []
    };
    state = {
        collapsed: true,
        confirmRunBRGM: false
    }
    renderDocs = (doc) => {
        const isDocAdded = this.isDocumentAdded(doc);
        const hasError = this.hasError(doc);
        return (
            <Row className={`row-eq-height ${hasError && 'text-danger' || ''}`}>
                <Col xs={10}>{doc.label}</Col>
                <Col xs={2}>
                    <div className="btn-group pull-right">
                        <div className={`dect-btn glyphicon glyphicon-plus ${(!isDocAdded && doc.uploaded && !hasError) && 'btn-hover' || 'dect-disabled' }`} onClick={() => {if (!isDocAdded && doc.uploaded && !hasError) {this.addDoc(doc); }}}></div>
                    </div>
                </Col>
            </Row>);
    }
    renderLayer = (layer) => {
        const {runnable} = this.props;
        const isLayerAdded = this.isLayerAdded(layer);
        const hasError = this.hasError(layer);
        return (
            <Row className={`row-eq-height ${hasError && 'text-danger' || ''}`}>
                <Col xs={10}>{layer.label}</Col>
                <Col xs={2}>
                    <div className="pull-right">
                        <div className={`dect-btn glyphicon glyphicon-plus ${(layer.uploaded && !isLayerAdded && !hasError) && 'btn-hover' || 'dect-disabled'}`} onClick={() => {if (!isLayerAdded && layer.uploaded && !hasError) {this.addLayer(layer); }}}></div>
                        <div className={`fa fa-pencil ${(runnable || !layer.uploaded) && 'dect-disabled' || 'btn-hover'}`} onClick={() => this.handleEdit(layer)}></div>
                    </div>
                </Col>
            </Row>);
    }
    renderOutputs= (outputs = []) => {
        return outputs.map((o, idx) => {
            return (
                <div key={idx} className="d-hazard">
                    <div className="container-fluid">
                        { (o.type === 'gn_layer' || o.type === 'literal') && this.renderLayer(o) || this.renderDocs(o)}
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
    renderErrors = (errors) => {
        return (
            <Alert bsStyle="danger">
                <span style={{textAlign: 'left'}}>
                    <h4>
                        <Message msgId="wpserrortitle"/>
                    </h4>
                        {this.formatError(errors)}
                    </span>
            </Alert>
        );
    }
    renderBody = () => {
        const {run} = this.props;
        const p = run.properties || {};
        const hasError = p.wps && p.wps.execution && p.wps.execution.errors && p.wps.execution.errors.length > 0;
        return (
            <Col xs={12}>
                {hasError ? this.renderErrors(p.wps.execution.errors) : null}
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
        const {title, created_at: created, outputs= [], wps = {}} = run.properties || {};
        const isUploaded = head(outputs.filter(o => !o.uploaded)) ? false : true;
        const isCompleted = wps && wps.execution && wps.execution.completed;
        const isRunning = wps && wps.execution && !wps.execution.completed;
        const hasError = wps && wps.execution && wps.execution.errors && wps.execution.errors.length > 0;
        return (
            <Row key={run.id} className="d-hazard" style={{margin: "10px 15px", paddingRight: 1}}>
                <Row key={run.id} className="flex-center">
                      {isRunning && (
                        <Col xs={2}>
                            <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/>
                        </Col>)
                            || null}

                    <Col xs={isRunning && 8 || 10}>
                      <Grid className={hasError && 'text-danger' || ''} fluid>
                        <Row >
                          <Col xs={12}>
                            <h5 ><strong>{title}</strong></h5>
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
                    { runnable ? (<div className={`dect-btn glyphicon glyphicon-play-circle d-icon-rotete ${(isCompleted || isRunning) && 'dect-disabled' || 'btn-hover'}`} onClick={this.handleRun}></div>) :
                    ( <div className={`dect-btn glyphicon glyphicon-upload d-icon-rotete ${(isUploaded) && 'dect-disabled' || 'btn-hover'}`} onClick={this.handleUpload}></div>)
                    }
                  </Col>
                  <Col xs={1} className="text-center">
                      <div className={`dect-btnglyphicon glyphicon-chevron-${this.state.collapsed && 'left' || 'down'} d-icon-rotete btn-hover`} onClick={this.toggle}></div>
                  </Col>
              </Row>
              <Row className={`flex-center collapse ${this.state.collapsed && 'hidden' || ''}`}>
                  {this.renderBody()}
              </Row>
              {this.state.confirmRunBRGM ? (
                    <Portal>
                        <ConfirmDialog onConfirm={this.runBrgm} onClose={this.handleClose} show={this.state.confirmRunBRGM} title={<Message msgId="decatassessment.runBrgmTitle" />} >
                              <Message msgId="decatassessment.runBrgm"/>
                        </ConfirmDialog>
                    </Portal>) : null}
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
    isLayerAdded = (layer) => {
        const {layers, runnable} = this.props;
        return runnable ? !(layers.filter(l => l.name === `${layer.id}`).length === 0) : !(layers.filter(l => l.name === layer.data).length === 0);
    }
    isDocumentAdded = (doc) => {
        const {documents} = this.props;
        return !(documents.filter(d => d.id === doc.id).length === 0);
    }
    addLayer = (l) => {
        const {run} = this.props;
        this.props.addRunLayer(l, run);
    }
    addDoc = (d) => {
        const {addReport, run} = this.props;
        const {title, created_at: createdAt} = run.properties;
        const subtitle = `${title} ${moment(createdAt).format('YYYY-MM-DD hh:mm A')}`;
        addReport({subtitle, ...d});
    }
    handleEdit = (l) => {
        const {editLayer, runnable} = this.props;
        if (!runnable && l.uploaded) {
            if (editLayer) {
                editLayer(l);
            }else {
                try {
                    window.open(l.data, '_balnk');
                }catch (e) {
                    return e;
                }
            }
        }
    }
    handleRun = () => {
        const {run} = this.props;
        const {wps} = run.properties;
        const isCompleted = wps && wps.execution && wps.execution.completed;
        const isRunning = wps && wps.execution && !wps.execution.completed;
        if (!isCompleted && !isRunning) {
            this.setState({confirmRunBRGM: true});
        }
    }
    handleClose = () => {
        this.setState({confirmRunBRGM: false});
    }
    runBrgm = () => {
        const {runBrgm, run} = this.props;
        this.setState({confirmRunBRGM: false});
        runBrgm(run.id);
    }
    formatError = (errors) => {
        return errors.map((e, idx) =>(
            <Row key={idx}>
                <Col xs={12} className="alertsErrorContent">{e.text}</Col>
            </Row>));
    }
    hasError = (el) => {
        return el.uploaded && (el.data.length === 0 || el.data === "[]");
    }
}

module.exports = Run;
