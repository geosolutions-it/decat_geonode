/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Grid, Row, Col, Panel, Button, Accordion} = require('react-bootstrap');
// const moment = require('moment');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');
const PropTypes = require('prop-types');
// const AlertsUtils = require('../utils/AlertsUtils');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const PaginationToolbar = require('../../MapStore2/web/client/components/misc/PaginationToolbar');
const ConfirmDialog = require('../../MapStore2/web/client/components/misc/ConfirmDialog');
const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const AlertsUtils = require('../utils/AlertsUtils');


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
          loadModels: PropTypes.func,
          cancelAddAssessment: PropTypes.func,
          accordionHeight: PropTypes.number,
          models: PropTypes.array,
          filter: PropTypes.element,
          showModel: PropTypes.func
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
          loadModels: () => {},
          showModel: () => {},
          height: 400,
          status: {
              saving: false,
              saveError: null
          }
      };
      state = {
          showConfirm: false
      }
      getHazard = (type) => {
          return AlertsUtils.getHazardIcon(this.props.hazards, type);
      };
    renderModels = () => {
        const {models = []} = this.props;
        return models.map((model) => {
            const {title, hazard_type} = model.properties || {};
            return (<Row key={model.id} className={`d-hazard flex-center`}>
                <Col xs={1} className="text-center ">
                  <h5 className={`fa icon-${this.getHazard(hazard_type)} fa-2x`}></h5>
                </Col>
                <Col xs={9}>
                    <Grid fluid>
                        <Row>
                            <Col xs={12}>
                                <h5><strong>{title}</strong></h5>
                            </Col>
                        </Row>
                    </Grid>
                </Col>
                <Col xs={1} className="text-center">
                    <div className="glyphicon glyphicon-cog show-model" onClick={() => this.props.showModel(model)}></div>
                </Col>
            </Row>);
        });
    }
    render() {
        const {height, models, pageSize, page, total, filter} = this.props;
        const accordionHeight = height - ( 52 + 5 + 52 + 5 + 72 + 60);
        return (
            <div id="decat-impact-assessment" key="decat-impact-assessment" className="decat-accordion" style={{height: height - 20}} >
                <Accordion defaultActiveKey="1">
                    <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatassessment.models")}</div></span>} eventKey="1" collapsible>
                        <div style={{overflow: 'auto', height: accordionHeight}}>
                            <Grid fluid style={{padding: 0}}>
                                <Row style={{margin: 0}}>
                                    <div style={{overflow: 'auto', height: accordionHeight - (84 + 34) }}>
                                        {this.renderModels()}
                                    </div>
                                </Row>
                                <Row style={{margin: 0}}>
                                    <Col xs={12} className="text-center">
                                        <PaginationToolbar items={models} pageSize={pageSize} page={page} total={total} onSelect={this.handlePageChange}/>
                                    </Col>
                                </Row>
                            </Grid>
                        </div>
					</Panel>
					<Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.filter")}</div></span>} eventKey="2" collapsible>
						<div style={{overflow: 'auto', height: accordionHeight}}>{filter}</div>
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
    handlePageChange = (page) => {
        this.props.loadModels(undefined, page);
    };
}

module.exports = ImpactAssessment;
