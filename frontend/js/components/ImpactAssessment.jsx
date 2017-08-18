/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Button, Accordion, Panel} = require('react-bootstrap');
// const {Grid, Row, Col, Panel, ButtonGroup, Button, Accordion} = require('react-bootstrap');
// const moment = require('moment');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const PropTypes = require('prop-types');
// const AlertsUtils = require('../utils/AlertsUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
// const PaginationToolbar = require('../../MapStore2/web/client/components/misc/PaginationToolbar');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');

class ImpactAssessment extends React.Component {
    static propTypes = {
          className: PropTypes.string,
          height: PropTypes.number,
          currentHazard: PropTypes.object,
          hazards: PropTypes.array,
          onSave: PropTypes.func,
          onClose: PropTypes.func,
          status: PropTypes.object,
          pageSize: PropTypes.number,
          assessments: PropTypes.array,
          page: PropTypes.number,
          total: PropTypes.number,
          loadAssessments: PropTypes.func,
          cancelAddAssessment: PropTypes.func,
          accordionHeight: PropTypes.number
      };

      static contextTypes = {
          messages: PropTypes.object
      };
      static defaultProps = {
          className: 'd-hazard',
          pageSize: 10,
          page: 0,
          total: 0,
          assessments: [],
          onSave: () => {},
          onClose: () => {},
          cancelAddAssessment: () => {},
          currentHazard: {},
          loadAssessments: () => {},
          height: 400,
          status: {
              saving: false,
              saveError: null
          }
      };
      state = {
          showConfirm: false
      }
    render() {
        const {height} = this.props;
        const accordionHeight = height - ( 52 + 5 + 52 + 5 + 72 + 60);
        return (
            <div id="decat-impact-assessment" key="decat-impact-assessment" className="decat-accordion" style={{height: height - 20}} >
                <Accordion>
                    <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatassessment.models")}</div></span>} eventKey="1" collapsible>
                        <div style={{overflow: 'auto', height: accordionHeight}}></div>
					</Panel>
					<Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatassessment.targets")}</div></span>} eventKey="2" collapsible>
						<div style={{overflow: 'auto', height: accordionHeight}}></div>
					</Panel>
                </Accordion>
                <div style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: 'white', position: 'absolute', top: height - 80, width: "100%"}}>
                    <div className="text-center">
                        <Button bsSize="sm" onClick={this.handleCancel}><Message msgId="eventeditor.cancel"/></Button>
                    </div>
                </div>
                {this.state.showConfirm ? <Portal>
                            <ConfirmDialog onConfirm={this.handleConfirm} onClose={this.handleClose} show={this.state.showConfirm} title={<Message msgId="decatassessment.addnewassessmentTitle" />} >
                                <Message msgId="decatassessment.closenewassessment"/>
                            </ConfirmDialog>
                        </Portal> : null}
            </div>);
    }
    handleCancel = () => {
        this.setState({ showConfirm: true});
    };
    handleClose = () => {
        this.setState({ showConfirm: false});
    };
    handleConfirm = () => {
        this.setState({ showConfirm: false});
        this.props.cancelAddAssessment();
    };

}

module.exports = ImpactAssessment;
