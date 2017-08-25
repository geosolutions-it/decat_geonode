/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button, ButtonGroup, FormGroup, ControlLabel, FormControl, HelpBlock, Alert} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../MapStore2/web/client/components/misc/Dialog');
const PropTypes = require('prop-types');
const assign = require('object-assign');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const Spinner = require('react-spinkit');

class InputsPanel extends React.Component {
    static propTypes = {
        model: PropTypes.object,
        run: PropTypes.object,
        updateProperty: PropTypes.func,
        saveRun: PropTypes.func,
        height: PropTypes.number,
        onClose: PropTypes.func,
        uploading: PropTypes.bool,
        error: PropTypes.string
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
    renderNameDesc() {
        const {description, name} = this.props.run;
        return (
            <div className="d-bottom-border">
                <FormGroup>
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
            <FormGroup key={idx}>
                 <ControlLabel>{i.label}</ControlLabel>
                 <FormControl id={`${idx}`} type="text" placeholder={i.description} value={i.data} onChange={this.handleChangeInput}/>
                 {i.min_occurrencies > 0 && (<HelpBlock className="required"><Message msgId="decatassessment.required" /></HelpBlock>)}
            </FormGroup>
        ));
    }
    renderLoading = () => {
        return this.props.uploading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };
    renderError = () => {
        return this.props.error || true && (<Alert bsStyle="warning">
                                    <strong>Holy guacamole!</strong> Best check yo self, you're not looking too good.
                                </Alert>);
    };
    render() {
        const {onClose, height, uploading} = this.props;

        const disabled = !this.isValid() || uploading;
        return (
            <Dialog onClickOut={onClose} modal id="run-upload-files" style={{display: "block" }}>
                <span role="header">
                    <h4><Message msgId="decatassessment.addRun" /></h4>
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
                    <div style={{"float": "left"}}>{this.renderLoading()}{this.renderError()}</div>
                    <ButtonGroup>
                        <Button onClick={this.handleSave} disabled={disabled} bsStyle={this.confirmButtonBSStyle}><Message msgId="eventeditor.save" />
                        </Button>
                        <Button onClick={onClose}><Message msgId="cancel" /></Button>
                    </ButtonGroup>
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
}

module.exports = InputsPanel;
