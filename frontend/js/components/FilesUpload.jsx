/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Grid, Row, Col, Glyphicon, Button, ButtonGroup, FormGroup, FormControl, ControlLabel} = require('react-bootstrap');
const moment = require('moment');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../MapStore2/web/client/components/misc/Dialog');
const PropTypes = require('prop-types');

class FilesUpload extends React.Component {
    static propTypes = {
        run: PropTypes.object,
        output: PropTypes.array,
        onToggleVisibility: PropTypes.func,
        isAuthorized: PropTypes.func,
        permissionType: PropTypes.string,
        onCardClick: PropTypes.func,
        clickClassName: PropTypes.string,
        height: PropTypes.number.isRequired
    };
    static defaultProps = {
        clickClassName: "fa fa-paper-plane btn-send",
        permissionType: 'promoteevent',
        isAuthorized: () => (false),
        onCardClick: () => {}
    };
    render() {
        const p = true;
        return (
            <Dialog onClickout={() => {}} modal={p} id="run-upload-files" style={{display: "block" }}>
                <span role="header">
                    <h4><Message msgId="decatassessment.addRun" /></h4>
                </span>
                <span role="body">
                    <FormGroup>
                        <ControlLabel>Working example with validation</ControlLabel>
                        <FormControl
                                type="text"
                                placeholder="Enter text"
                                onChange={this.handleChange}
                        />
                        <FormControl.Feedback />
                        </FormGroup>
                </span>
                <span role="footer">
                    <ButtonGroup>
                        <Button onClick={this.onConfirm} disabled={this.confirmButtonDisabled} bsStyle={this.confirmButtonBSStyle}><Message msgId="confirm" />
                        </Button>
                        <Button onClick={this.onClose}><Message msgId="close" /></Button>
                    </ButtonGroup>
                </span>
            </Dialog>);

    }
}

module.exports = FilesUpload;
