const PropTypes = require('prop-types');
/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
// const {toggleControl} = require('../actions/controls');
const {loadMapInfo} = require('../../MapStore2/web/client/actions/config');
const MetadataModal = require('../../MapStore2/web/client/components/maps/modals/MetadataModal');
const {createThumbnail, onDisplayMetadataEdit, metadataChanged} = require('../../MapStore2/web/client/actions/maps');
const {editMap, updateCurrentMap, errorCurrentMap, resetCurrentMap} = require('../../MapStore2/web/client/actions/currentMap');
const {mapSelector} = require('../../MapStore2/web/client/selectors/map');
const stateSelector = state => state;
const {layersSelector} = require('../../MapStore2/web/client/selectors/layers');

const {createGeoNodeMap} = require('../actions/GeoNodeConfig');
const {saveAssessment} = require('../actions/impactassessment');

const selector = createSelector(mapSelector, stateSelector, layersSelector, (map, state, layers) => ({
    currentZoomLvl: map && map.zoom,
    show: state.controls && state.controls.saveAs && state.controls.saveAs.enabled,
    mapType: state && (state.home && state.home.mapType || state.maps && state.maps.mapType) || "leaflet",
    newMapId: state.currentMap && state.currentMap.newMapId,
    map,
    user: state.security && state.security.user,
    currentMap: state.currentMap,
    metadata: state.maps.metadata,
    layers,
    textSearchConfig: state.searchconfig && state.searchconfig.textSearchConfig,
    geonodeMapConfig: state.alerts && state.alerts.geonodeMapConfig,
    isAssessment: state.impactassessment && state.impactassessment.newAssessment && true || false
}));

class SaveAs extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        newMapId: PropTypes.number,
        map: PropTypes.object,
        user: PropTypes.object,
        mapType: PropTypes.string,
        layers: PropTypes.array,
        params: PropTypes.object,
        metadata: PropTypes.object,
        currentMap: PropTypes.object,
        // CALLBACKS
        onClose: PropTypes.func,
        onCreateThumbnail: PropTypes.func,
        onUpdateCurrentMap: PropTypes.func,
        onErrorCurrentMap: PropTypes.func,
        onSaveAssessment: PropTypes.func,
        editMap: PropTypes.func,
        resetCurrentMap: PropTypes.func,
        metadataChanged: PropTypes.func,
        onMapSave: PropTypes.func,
        loadMapInfo: PropTypes.func,
        textSearchConfig: PropTypes.object,
        geonodeMapConfig: PropTypes.object,
        isAssessment: PropTypes.bool
    };

    static contextTypes = {
        router: PropTypes.object
    };

    static defaultProps = {
        onMapSave: () => {},
        loadMapInfo: () => {},
        show: false,
        isAssessment: false
    };
    state = {
        displayMetadataEdit: false
    };
    render() {
        const {updating, error} = this.props.geonodeMapConfig || {};
        let map = (updating || error) && assign({updating, loading: updating || error, mapError: error}, this.props.currentMap) || this.props.currentMap;
        return (
            <MetadataModal ref="metadataModal"
                metadataChanged={this.props.metadataChanged}
                metadata={this.props.metadata}
                displayPermissionEditor={false}
                show={this.props.currentMap.displayMetadataEdit}
                onEdit={this.props.editMap}
                onUpdateCurrentMap={this.props.onUpdateCurrentMap}
                onErrorCurrentMap={this.props.onErrorCurrentMap}
                onHide={this.close}
                onClose={this.close}
                map={map}
                onSave={this.saveMap}
            />
        );
    }
    close = () => {
        this.props.onClose();
    };
    saveMap = (id, name, description) => {
        this.props.editMap(this.props.map);
        if (name !== "") {
            if (this.props.isAssessment) {
                this.props.onSaveAssessment({ title: name, 'abstract': description});
            }else {
                this.props.onMapSave({ title: name, 'abstract': description});
            }
        }
    };
}


module.exports = {
    SaveAsPlugin: connect(selector,
        {
            onClose: () => onDisplayMetadataEdit(false),
            onUpdateCurrentMap: updateCurrentMap,
            onErrorCurrentMap: errorCurrentMap,
            onMapSave: createGeoNodeMap,
            loadMapInfo,
            metadataChanged,
            editMap,
            resetCurrentMap,
            onDisplayMetadataEdit,
            onCreateThumbnail: createThumbnail,
            onSaveAssessment: saveAssessment
        })(assign(SaveAs, {
            BurgerMenu: {
                name: 'saveAs',
                position: 900,
                text: <Message msgId="saveAs"/>,
                icon: <Glyphicon glyph="floppy-open"/>,
                action: editMap.bind(null, {}),
                selector: (state) => {
                    const {security, alerts, impactassessment} = state;
                    // EDIT_COP NEW ASSESSMENT
                    const {mode} = impactassessment || {};
                    const mapId = alerts.geonodeMapConfig && alerts.geonodeMapConfig.id;
                    if ( (mode === 'EDIT_COP') || (mapId && security.defualtMapId !== mapId && mode !== 'NEW_ASSESSMENT')) {
                        return { style: {display: "none"} };
                    }
                    return security && state.security.user ? {} : { style: {display: "none"} };
                }
            }
        })),
    epics: require('../epics/GeoNodeConfig')
};
