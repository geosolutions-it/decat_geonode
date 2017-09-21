/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const { Button} = require('react-bootstrap');

const PropTypes = require('prop-types');
// const AlertsUtils = require('../utils/AlertsUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const AlertsUtils = require('../utils/AlertsUtils');


class EditCop extends React.Component {
    static propTypes = {
          className: PropTypes.string,
          height: PropTypes.number,
          currentHazard: PropTypes.object,
          hazards: PropTypes.array,
          onSave: PropTypes.func,
          pageSize: PropTypes.number,
          assessments: PropTypes.array,
          cancelAddAssessment: PropTypes.func,
          accordionHeight: PropTypes.number
      };

      static contextTypes = {
          messages: PropTypes.object
      };
      static defaultProps = {
          className: 'd-hazard',
          onSave: () => {},
          cancelAddAssessment: () => {},
          currentHazard: {},
          height: 400
      };
    state = {
        showConfirm: false
    }
    getHazard = (type) => {
        return AlertsUtils.getHazardIcon(this.props.hazards, type);
    }
    render() {
        const {height} = this.props;
        return (
            <div id="decat-impact-assessment" key="decat-impact-assessment" className="decat-accordion" style={{height: height - 20}} >
                TODO:: EDIT COP ANNOTATIONS
                <div style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', position: 'absolute', top: height - 80, width: "100%"}}>
                    <div className="text-center">
                        <Button bsSize="sm" onClick={this.handleCancel}><Message msgId="eventeditor.cancel"/></Button>
                    </div>
                </div>
                {this.state.showConfirm ? <Portal>
                            <ConfirmDialog onConfirm={this.handleConfirm} onClose={this.handleClose} show={this.state.showConfirm} title={<Message msgId="decatassessment.addnewassessmentTitle" />} >
                                <Message msgId="decatmanager.closecop"/>
                            </ConfirmDialog>
                        </Portal> : null}
            </div>);
    }
    handleCancel = () => {
        this.setState({ showConfirm: true});
    }
    handleClose = () => {
        this.setState({ showConfirm: false});
    }
    handleConfirm = () => {
        this.setState({ showConfirm: false});
        this.props.cancelAddAssessment();
    }
}

module.exports = EditCop;
