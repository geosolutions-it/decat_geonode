/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const PropTypes = require('prop-types');

require('../../css/decat.css');

const {connect} = require('react-redux');

const url = require('url');
const urlQuery = url.parse(window.location.href, true).query;

const ConfigUtils = require('../../MapStore2/web/client/utils/ConfigUtils');
const {loadMapConfig} = require('../../MapStore2/web/client/actions/config');
const {resetControls} = require('../../MapStore2/web/client/actions/controls');

const MapViewer = require('../../MapStore2/web/client/containers/MapViewer');

let oldLocation;

class MapViewerPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMapConfig: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop'
    };

    componentWillMount() {
        if (oldLocation !== this.props.location) {
            oldLocation = this.props.location;
            /*if (!ConfigUtils.getDefaults().ignoreMobileCss) {
                if (this.props.mode === 'mobile') {
                    require('../assets/css/mobile.css');
                }
            }*/

            // VMap = require('../components/viewer/Map')(this.props.params.mapType);
            let mapId = this.props.match.params.mapId === '0' ? null : this.props.match.params.mapId;
            let config = urlQuery && urlQuery.config || null;
            // if mapId is a string, is the name of the config to load
            try {
                let mapIdNumber = parseInt(mapId, 10);
                if (isNaN(mapIdNumber)) {
                    config = mapId;
                    mapId = null;
                }
            } catch (e) {
                config = mapId;
                mapId = null;
            }
            const {configUrl} = ConfigUtils.getConfigurationOptions({mapId, config: config || '/static/decat/config'});
            // this.props.reset();
            this.props.loadMapConfig(configUrl, mapId);
        }
    }

    render() {
        return (<MapViewer
            plugins={this.props.plugins}
            params={this.props.match.params}
            />);
    }
}

module.exports = connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
    {
        loadMapConfig,
        reset: resetControls
    })(MapViewerPage);
