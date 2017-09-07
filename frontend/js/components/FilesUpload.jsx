/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button, ButtonGroup, FormGroup, ControlLabel, HelpBlock} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../MapStore2/web/client/components/misc/Dialog');
const PropTypes = require('prop-types');
const {head, pickBy, identity} = require('lodash');
const assign = require('object-assign');
const Spinner = require('react-spinkit');
const {isArray} = require('lodash');

function getOutput(id, outputs) {
    return head(outputs.filter(o => o.id === parseInt(id, 10)));
}
function isUploaded(id, outputs) {
    return getOutput(id, outputs).uploaded;
}
function getFiltredFiles(files, outputs) {
    return Object.keys(files).reduce((out, k) => {
        return isUploaded(k, outputs) ? out : assign({}, out, {[k]: files[k]});
    }, {});
}
class FilesUpload extends React.Component {
    static propTypes = {
        model: PropTypes.object,
        run: PropTypes.object,
        files: PropTypes.array,
        onUploadFiles: PropTypes.func,
        height: PropTypes.number,
        onClose: PropTypes.func,
        uploading: PropTypes.bool,
        uploadingErrors: PropTypes.object
    };
    static defaultProps = {
        height: 400,
        uploading: false,
        uploadingErrors: {},
        onUploadFiles: () => {},
        onClose: () => {}
    };
    state = {
        outputs: {}
    }
    renderFile = (o) => {
        const {outputs} = this.state;
        const {uploadingErrors, uploading} = this.props;
        const hasError = uploadingErrors[o.id];
        return (
            <FormGroup key={o.id} validationState={hasError && 'error' || null}>
                <ControlLabel>{o.label}</ControlLabel>
                <div className="input-group">
                    <input type="text" className="form-control" value={outputs[o.id] && outputs[o.id].name || ''} readOnly/>
                    <span className="input-group-btn">
                        <span className={`btn btn-primary btn-file ${uploading && 'disabled'}`}>
                            <Message msgId="decatassessment.browse"/>
                            {!uploading ? (<input type="file" onChange={(e) => this.handleChange(e, o)} accept={o.type === 'gn_layer' && '.zip'}/>) : null}
                        </span>
                    </span>
                </div>
                {hasError ? (<HelpBlock>{this.formatError(hasError)}</HelpBlock>) : null }
            </FormGroup>
        );
    };
    renderUploaded = (o) => {
        const meta = JSON.parse(o.meta || '') || {};
        return (
            <FormGroup key={o.id} validationState="success">
                <ControlLabel>{o.label}</ControlLabel>
                <div className="input-group">
                    <input type="text" className="form-control" value={meta.name || 'Uploaded'} readOnly/>
                    <span className="input-group-btn">
                        <span className="btn btn-primary btn-file disabled has-success">
                            <Message msgId="decatassessment.browse"/>
                        </span>
                    </span>
                </div>
            </FormGroup>);
    };
    renderFiles = () => {
        const {run} = this.props;
        return (run.properties.outputs || []).map( o => o.uploaded && this.renderUploaded(o) || this.renderFile(o));
    }
    renderLoading = () => {
        return this.props.uploading ? <Spinner spinnerName="circle" key="loadingSpinner" noFadeIn overrideSpinnerClassName="spinner"/> : null;
    };
    render() {
        const {run= {}, onClose, uploading, height} = this.props;
        const disabled = Object.keys(getFiltredFiles(this.state.outputs, run.properties.outputs)).length === 0;
        return (
            <Dialog onClickOut={onClose} modal id="run-upload-files" style={{display: "block" }}>
                <span role="header">
                    <span className="user-panel-title"><strong>{run.properties.name}&nbsp;<Message msgId="decatassessment.uploadRun" /></strong></span>
                    <button onClick={this.props.onClose} className="login-panel-close close">
                        <span>×</span>
                    </button>
                </span>
                <span role="body">
                    <div style={{height: height - 600, minHeight: 200, overflow: 'auto', marginTop: 20}}>
                        <form id="file-uploader">
                            {this.renderFiles()}
                        </form>
                    </div>
                </span>
                <span role="footer">
                    <div style={{"float": "left"}}>{this.renderLoading()}</div>
                    <ButtonGroup>
                        <Button onClick={this.handleUpload} disabled={disabled || uploading} bsStyle={this.confirmButtonBSStyle}><Message msgId="decatassessment.upload" />
                        </Button>
                        <Button onClick={onClose}><Message msgId="cancel" /></Button>
                    </ButtonGroup>
                </span>
            </Dialog>);

    }
    handleChange = (e, o) => {
        const outputs = pickBy(assign({}, this.state.outputs, {[o.id]: head(e.target.files)}), identity);
        this.setState({outputs} );
    }
    handleUpload = () => {
        const {outputs} = this.props.run.properties;
        this.props.onUploadFiles(getFiltredFiles(this.state.outputs, outputs));
    }
    formatError = (errors = []) => {
        return (isArray(errors) && errors || [].concat(errors)).map((e, id) => (
                <span className="upload-error" key={id}>{e}</span>
            ));
    }
}

module.exports = FilesUpload;
