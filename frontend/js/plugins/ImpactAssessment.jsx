/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const assign = require('object-assign');

const {Accordion, Panel} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');

const {loadRegions, selectRegions, toggleEntityValue, onSearchTextChange, resetAlertsTextSearch, toggleEntities,
    loadEvents, toggleEventVisibility} = require('../actions/alerts');
const {showHazard, toggleImpactMode, loadAssessments, addAssessment, cancelAddAssessment, promoteAssessment, toggleHazards,
    toggleHazard, loadModels, showModel, loadRuns, toggleModelMode, onUploadFiles, updateProperty, saveRun, addRunLayer, addReport, runBrgm, bgrmError, deleteRun} = require('../actions/impactassessment');
const {changeInterval} = require('../actions/alerts');
const {isAuthorized} = require('../utils/SecurityUtils');
const {connect} = require('react-redux');
const ReactCSSTransitionGroup = require('react-addons-css-transition-group');

const Portal = require('../../MapStore2/web/client/components/misc/Portal');
const closeModelPanels = toggleModelMode.bind(null, '', undefined);
const removeBrgmError = bgrmError.bind(null, null);
const ErrorModalPanel = connect((state) => ({ error: state.impactassessment && state.impactassessment.brgmError}), {
    onClose: removeBrgmError
})(require('../components/ErrorModal'));
const FilesUpload = connect((state) => ({
    model: state.impactassessment && state.impactassessment.currentModel || {},
    run: state.impactassessment && state.impactassessment.run || {},
    uploadingErrors: state.impactassessment && state.impactassessment.uploadingErrors,
    uploading: state.impactassessment && state.impactassessment.uploading
}), {
    onClose: closeModelPanels,
    onUploadFiles
})(require('../components/FilesUpload'));

const InputsPanel = connect((state) => ({
    model: state.impactassessment && state.impactassessment.currentModel || {},
    run: state.impactassessment && state.impactassessment.run || {},
    error: state.impactassessment && state.impactassessment.saveRunError,
    runSaving: state.impactassessment && state.impactassessment.runSaving
}), {
    onClose: closeModelPanels,
    updateProperty,
    saveRun
})(require('../components/InputsPanel'));

const ImpactAssessmentPanel = connect((state) => ({
    models: state.impactassessment && state.impactassessment.models,
    hazards: state.alerts && state.alerts.hazards || [],
    page: state.impactassessment && state.impactassessment.modelsInfo && state.impactassessment.modelsInfo.page || 0,
    pageSize: state.impactassessment && state.impactassessment.modelsInfo && state.impactassessment.modelsInfo.pageSize || 5,
    total: state.impactassessment && state.impactassessment.modelsInfo && state.impactassessment.modelsInfo.total || 0

}), {cancelAddAssessment, loadModels, showModel})(require('../components/ImpactAssessment'));

const ModelPanel = connect((state) => ({
    hazards: state.alerts && state.alerts.hazards || [],
    currentModel: state.impactassessment && state.impactassessment.currentModel || {},
    runs: state.impactassessment && state.impactassessment.runs || [],
    page: state.impactassessment && state.impactassessment.runsInfo && state.impactassessment.runsInfo.page || 0,
    pageSize: state.impactassessment && state.impactassessment.runsInfo && state.impactassessment.runsInfo.pageSize || 10,
    total: state.impactassessment && state.impactassessment.runsInfo && state.impactassessment.runsInfo.total || 0,
    run: state.impactassessment && state.impactassessment.run || {},
    layers: state.layers && state.layers.flat || [],
    documents: state.impactassessment && state.impactassessment.documents || [],
    currentHazard: state.impactassessment && state.impactassessment.currentHazard
}), {
    onClose: toggleImpactMode.bind(null, 'NEW_ASSESSMENT'),
    loadRuns,
    toggleMode: toggleModelMode,
    addRunLayer,
    addReport,
    runBrgm,
    deleteRun
})(require('../components/Model'));

const TimeFilter = connect((state) => ({
        currentInterval: state.alerts && state.alerts.currentInterval
    }), {
        changeInterval
    })(require('../components/TimeFilter'));
const HazardsFilter = connect((state) => ({
    title: "decatwarning.hazardsfilter",
    entities: state.alerts && state.alerts.hazards || []
}), {
    toggleEntity: toggleEntityValue.bind(null, 'hazards'),
    toggleEntities: toggleEntities.bind(null, 'hazards')
    })(require('../components/MultiValueFilter'));

const HazardsModelsFilter = connect((state) => ({
        title: "decatwarning.hazardsfilter",
        entities: state.impactassessment && state.impactassessment.hazards || []
    }), {
        toggleEntity: toggleHazard,
        toggleEntities: toggleHazards
        })(require('../components/MultiValueFilter'));

const LevelsFilter = connect((state) => ({
    title: "decatwarning.levelsfilter",
    entities: state.alerts && state.alerts.levels || []
}), {
    toggleEntity: toggleEntityValue.bind(null, 'levels'),
    toggleEntities: toggleEntities.bind(null, 'levels')
})(require('../components/MultiValueFilter'));

const LocationFilter = connect((state) => ({
        regions: state.alerts && state.alerts.regions || {},
        regionsLoading: state.alerts && state.alerts.regionsLoading || false,
        selectedRegions: state.alerts && state.alerts.selectedRegions || []
 }), {
     loadRegions,
     selectRegions
 })(require('../components/LocationFilter'));

const Events = connect((state) => ({
    events: (state.alerts && state.alerts.events || []).map((ev) => assign({}, ev, {
        visible: state.alerts && state.alerts.selectedEvents && state.alerts.selectedEvents.filter(e => e.id === ev.id).length !== 0 || false
    })),
    hazards: state.alerts && state.alerts.hazards || [],
    page: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.page || 0,
    pageSize: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.pageSize || 10,
    total: state.alerts && state.alerts.eventsInfo && state.alerts.eventsInfo.total || 0,
    isAuthorized,
    searchInput: state.alerts && state.alerts.searchInput,
    serchedText: state.alerts && state.alerts.serchedText
}), {
    onEditEvent: showHazard,
    onToggleVisibility: toggleEventVisibility,
    onSearchTextChange,
    resetAlertsTextSearch,
    loadEvents
})(require('../components/Events'));

const HazardPanel = connect((state) => ({
    hazards: state.alerts && state.alerts.hazards || [],
    currentHazard: state.impactassessment && state.impactassessment.currentHazard || {},
    assessments: state.impactassessment && state.impactassessment.assessments || [],
    page: state.impactassessment && state.impactassessment.assessmentsInfo && state.impactassessment.assessmentsInfo.page || 0,
    pageSize: state.impactassessment && state.impactassessment.assessmentsInfo && state.impactassessment.assessmentsInfo.pageSize || 10,
    total: state.impactassessment && state.impactassessment.assessmentsInfo && state.impactassessment.assessmentsInfo.total || 0
}), {
    onClose: toggleImpactMode.bind(null, 'HAZARDS'),
    loadAssessments,
    addAssessment,
    promoteAssessment
})(require('../components/Hazard'));


class ImpactAssessment extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        mode: PropTypes.string,
        eventsLoading: PropTypes.bool,
        modelMode: PropTypes.string

    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        mode: 'HAZARDS',
        height: 798,
        eventsLoading: false
    };
    renderList = () => {
        const {height} = this.props;
        const accordionHeight = height - (50 + 41 + 52 + 5 + 52 + 5 + 72);
        return (<div id="decat-impact-assessment" className="decat-accordion" >
            <Accordion defaultActiveKey="1">
                <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatassessment.hazards")}</div></span>} eventKey="1" collapsible>
                    <div style={{overflow: 'hidden', height: accordionHeight}}>
                        <Events editPermission="edithazard" editClassName="fa fa-caret-right open-assessment" height={accordionHeight}/>
                    </div>
                </Panel>
                <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.filter")}</div></span>} eventKey="2" collapsible>
                    <div style={{overflow: 'auto', height: accordionHeight}}>
                        <LocationFilter title="decatwarning.regionsfilter" placeholder={LocaleUtils.getMessageById(this.context.messages, "decatwarning.locationplaceholder")}/>
                        <TimeFilter/>
                        <HazardsFilter/>
                        <LevelsFilter/>
                    </div>
                </Panel>
            </Accordion>
        </div>);
    };
    renderHazard = () => {
        const height = this.props.height - (50 + 41 + 42);
        return <HazardPanel height={height} mode={this.props.mode}/>;
    };
    renderNewAssessment = () => {
        const height = this.props.height - (50 + 41 + 42);
        return (<ImpactAssessmentPanel filter={<HazardsModelsFilter/>} height={height}/>);
    };
    renderModel= () => {
        const height = this.props.height - (50 + 41 + 42);
        return <ModelPanel height={height} mode={this.props.mode}/>;
    };
    renderLoading = () => {
        return (<div style={{
                    position: "relative",
                    width: "60px",
                    top: "50%",
                    left: "calc(50% - 30px)"}}>
                    <Spinner style={{width: "60px"}} spinnerName="three-bounce" noFadeIn overrideSpinnerClassName="spinner"/>
                </div>);
    };
    renderInputsPanel = () => {
        const {modelMode, height} = this.props;
        return modelMode === 'NEW_RUN' ? (
                    <Portal>
                        <InputsPanel height={height}/>
                    </Portal>) : null;
    }
    renderFilesPanel = () => {
        const {modelMode, height} = this.props;
        return modelMode === 'UPLOAD_RUN_FILES' ? (
                    <Portal>
                        <FilesUpload height={height}/>
                    </Portal>) : null;
    }
    renderBody = () => {
        const loading = this.props.eventsLoading ? this.renderLoading() : null;
        switch (this.props.mode) {
            case 'HAZARD':
                return (<span key="decat-hazard-panel">
                            {this.renderHazard()}
                            {loading}
                        </span>);
            case 'NEW_ASSESSMENT':
                return (<span key="decat-new-impact-assessment">
                            {this.renderNewAssessment()}
                            {loading}
                        </span>);
            case 'MODEL':
                return (<span key="decat-model">
                            {this.renderModel()}
                            {loading}
                            {this.renderInputsPanel()}
                            {this.renderFilesPanel()}
                            <ErrorModalPanel/>
                        </span>);
            default:
                return (<span key="decat-impact-assessment">
                            {this.renderList()}
                            {loading}
                        </span>);
        }
    };
    render() {
        return (
        <ReactCSSTransitionGroup
            transitionName="early-warning-transition"
            transitionAppearTimeout={300}
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
                {this.renderBody()}
        </ReactCSSTransitionGroup>);
    }
}

const ImpactAssessmentPlugin = connect((state) => ({
    mode: state.impactassessment && state.impactassessment.mode || 'HAZARDS',
    modelMode: state.impactassessment && state.impactassessment.modelMode || '',
    height: state.map && state.map.present && state.map.present.size && state.map.present.size.height || 798,
    eventsLoading: (state.alerts && state.alerts.eventsLoading) || (state.impactassessment && state.impactassessment.assessmentsLoading) || false
}))(ImpactAssessment);

module.exports = {
    ImpactAssessmentPlugin: assign(ImpactAssessmentPlugin, {
        disablePluginIf: "{state('currentRole') !== 'impact-assessor'}",
        DrawerMenu: {
            name: 'impact-assessment',
            position: 1,
            glyph: "flash",
            title: 'impactassessment',
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "impactassessment"
            },
            priority: 1
        }
    }),
    epics: require('../epics/impactassessment'),
    reducers: {
        impactassessment: require('../reducers/impactassessment')
    }
};
