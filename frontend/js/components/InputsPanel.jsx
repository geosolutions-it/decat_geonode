/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button, ButtonGroup, FormGroup, ControlLabel, FormControl, HelpBlock, Alert, Row, Grid, Col} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../MapStore2/web/client/components/misc/Dialog');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const Spinner = require('react-spinkit');
const AlertsUtils = require('../utils/AlertsUtils');

class InputsPanel extends React.Component {
    static propTypes = {
        model: PropTypes.object,
        run: PropTypes.object,
        updateProperty: PropTypes.func,
        saveRun: PropTypes.func,
        height: PropTypes.number,
        onClose: PropTypes.func,
        runSaving: PropTypes.bool,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        height: 400,
        uploading: false,
        updateProperty: () => {},
        onClose: () => {},
        saveRun: () => {},
        run: {}
    };
    getValidationState = (input) => {
        return input.min_occurrencies > 0 && input.data.length === 0 && 'error';
    }
    renderNameDesc() {
        const {description, name = ''} = this.props.run.properties;
        return (
            <div className="d-bottom-border">
                <FormGroup validationState={name.length === 0 && 'error'}>
                     <ControlLabel><Message msgId="decatassessment.name" /></ControlLabel>
                     <FormControl id="name" type="text" value={name} onChange={this.handleChange} placeholder={LocaleUtils.getMessageById(this.context.messages, "decatassessment.namePlaceholder")}/>
                     <HelpBlock className="required"><Message msgId="decatassessment.required" /></HelpBlock>
                </FormGroup>
                <FormGroup>
                    <ControlLabel><Message msgId="decatassessment.description" /></ControlLabel>
                     <FormControl id="description" type="text" value={description} onChange={this.handleChange} placeholder={LocaleUtils.getMessageById(this.context.messages, "decatassessment.descriptionPlaceholder")}/>
               </FormGroup>
           </div>
        );
    }
    renderInputs() {
        const {inputs = []} = this.props.run.properties;
        return inputs.map((i, idx) => (
            <FormGroup key={idx} validationState={this.getValidationState(i) }>
                 <ControlLabel>{i.label}</ControlLabel>
                 <FormControl id={`${idx}`} type="text" placeholder={i.description} value={i.data} onChange={this.handleChangeInput}/>
                 {i.min_occurrencies > 0 && (<HelpBlock className="required"><Message msgId="decatassessment.required" /></HelpBlock>)}
            </FormGroup>
        ));
    }
    renderLoading = () => {
        return this.props.runSaving ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };
    renderError = () => {
        return this.props.error && (
                    <Alert bsStyle="danger">
                        <span style={{textAlign: 'left'}}>
                            <h4>
                                <Message msgId="eventeditor.saveerror"/>
                            </h4>
                            {this.formatError(this.props.error)}
                        </span>
                    </Alert>);
    };
    render() {
        const {onClose, height, runSaving} = this.props;

        const disabled = !this.isValid() || runSaving;
        return (
            <Dialog onClickOut={onClose} modal id="run-upload-files" style={{display: "block" }}>
                <span role="header">
                    <span className="user-panel-title"><strong><Message msgId="decatassessment.addRun" /></strong></span>
                    <button onClick={this.props.onClose} className="login-panel-close close">
                        <span>×</span>
                    </button>
                </span>
                <span role="body">
                    <form id="run-inputs">
                        {this.renderNameDesc()}
                        <div style={{height: height - 600, minHeight: 200, overflow: 'auto', marginTop: 20}}>
                            <strong><h4>Input settings</h4></strong>
                            {this.renderInputs()}
                        </div>

                    </form>
                </span>
                <span role="footer">
                    <Grid fluid>
                        <Row>
                            <Col xs={12}>{this.renderLoading()}{this.renderError()}</Col>
                        </Row>
                        <Row>
                            <ButtonGroup>
                                <Button onClick={this.handleSave} disabled={disabled} bsStyle={this.confirmButtonBSStyle}><Message msgId="eventeditor.save" />
                                </Button>
                                <Button onClick={onClose}><Message msgId="cancel" /></Button>
                            </ButtonGroup>
                        </Row>
                    </Grid>
                </span>
            </Dialog>);

    }
    handleChangeInput = (e) => {
        const {run, updateProperty} = this.props;
        const {id, value} = e.target;
        updateProperty('inputs', run.properties.inputs.map((i, idx) => idx === parseInt(id, 10) && assign({}, i, {data: value}) || i));
    };
    handleChange = (e) => {
        const {updateProperty} = this.props;
        const {id, value} = e.target;
        updateProperty(id, value);
    };
    handleSave = () => {
        this.props.saveRun(this.props.run);
    };
    isValid = () => {
        const {properties: p} = this.props.run;
        return p.name && p.name.length > 0 && (p.inputs.filter((i) => i.min_occurrencies > 0 && i.data.length === 0)).length === 0;
    };
    formatError = (errors) => {
        return AlertsUtils.flatErrors(errors || {}).map((e, idx) =>
            (<Row key={idx}><Col xs={4} className="alertsErrorTitle">{e.title}</Col><Col xs={8} className="alertsErrorContent">{e.text}</Col></Row>));
    };
}

module.exports = InputsPanel;
