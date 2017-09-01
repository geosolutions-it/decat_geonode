/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Alert, Row, Col} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const Dialog = require('../../MapStore2/web/client/components/misc/Dialog');
const PropTypes = require('prop-types');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');

class ErrorModal extends React.Component {
    static propTypes = {
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        onClose: PropTypes.func,
        titleMessage: PropTypes.string
    };
    static contextTypes = {
        messages: PropTypes.object
    };
    static defaultProps = {
        height: 400,
        onClose: () => {},
        titleMessage: 'wpserrortitle'
    }
    render() {
        const {onClose, error, titleMessage} = this.props;
        return error ? (
            <Portal>
                <Dialog onClickOut={onClose} modal id="run-upload-files" style={{display: "block" }}>
                    <span role="header">
                        <span className="user-panel-title"><strong><Message msgId={titleMessage}/></strong></span>
                        <button onClick={onClose} className="login-panel-close close">
                            <span>×</span>
                        </button>
                    </span>
                    <span role="body">
                        <Alert bsStyle="danger">
                            <span style={{textAlign: 'left'}}>
                                <h4>
                                    {error.title}
                                </h4>
                                <Row>
                                    <Col xs={12} className="alertsErrorContent">{error.text}</Col>
                                </Row>
                            </span>
                        </Alert>
                    </span>
                </Dialog>
            </Portal>
            ) : null;
    }
}

module.exports = ErrorModal;
