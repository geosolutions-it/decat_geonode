/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const PropTypes = require('prop-types');


const React = require('react');
const {connect} = require('react-redux');
const {createSelector} = require('reselect');
const assign = require('object-assign');
const {Glyphicon} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const {toggleControl} = require('../../MapStore2/web/client/actions/controls');
const {updateGeoNodeMap} = require('../actions/GeoNodeConfig');
const ConfirmModal = require('../../MapStore2/web/client/components/maps/modals/ConfirmModal');

const {mapSelector} = require('../../MapStore2/web/client/selectors/map');
const {layersSelector} = require('../../MapStore2/web/client/selectors/layers');
const stateSelector = state => state;


const selector = createSelector(mapSelector, stateSelector, layersSelector, (map, state, layers) => ({
    currentZoomLvl: map && map.zoom,
    show: state.controls && state.controls.save && state.controls.save.enabled,
    map,
    mapId: map && map.mapId,
    layers,
    textSearchConfig: state.searchconfig && state.searchconfig.textSearchConfig
}));

class Save extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        mapId: PropTypes.string,
        onClose: PropTypes.func,
        onMapSave: PropTypes.func,
        map: PropTypes.object,
        layers: PropTypes.array,
        params: PropTypes.object,
        textSearchConfig: PropTypes.object
    };

    static defaultProps = {
        onMapSave: () => {},
        show: false
    };


    render() {
        return (<ConfirmModal
            confirmText={<Message msgId="save" />}
            cancelText={<Message msgId="cancel" />}
            titleText={<Message msgId="map.saveTitle" />}
            body={<Message msgId="map.saveText" />}
            show={this.props.show}
            onClose={this.props.onClose}
            onConfirm={this.goForTheUpdate}
            />);
    }
    goForTheUpdate = () => {
        this.props.onMapSave();
        this.props.onClose();
    };
}

module.exports = {
    SavePlugin: connect(selector,
        {
            onClose: toggleControl.bind(null, 'save', false),
            onMapSave: updateGeoNodeMap
        })(assign(Save, {
            BurgerMenu: {
                name: 'save',
                position: 900,
                text: <Message msgId="save"/>,
                icon: <Glyphicon glyph="floppy-open"/>,
                action: toggleControl.bind(null, 'save', null),
            // display the BurgerMenu button only if the map can be edited
                selector: (state) => {
                    const {security, alerts} = state;
                    const mapId = alerts.geonodeMapConfig && alerts.geonodeMapConfig.id;
                    if (security.defualtMapId === mapId ) {
                        return { style: {display: "none"} };
                    }
                    return {};
                }
            }
        }))
};
