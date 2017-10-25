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
const {resetControls} = require('../../MapStore2/web/client/actions/controls');

const MapViewer = require('../../MapStore2/web/client/containers/MapViewer');

let oldLocation;

class MapPermaLinkPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        loadMapConfig: PropTypes.func,
        reset: PropTypes.func,
        plugins: PropTypes.object,
        location: PropTypes.object
    };

    static defaultProps = {
        mode: 'desktop',
        loadMapConfig: () => {}
    };

    componentWillMount() {
        if (oldLocation !== this.props.location) {
            oldLocation = this.props.location;

            const mapId = parseInt(this.props.match.params.mapId, 10);
            const hazardId = parseInt(this.props.match.params.hazardId, 10);
            const annotationId = this.props.match.params.annotationId;
            ConfigUtils.setConfigProp('permalinkMap', mapId);
            ConfigUtils.setConfigProp('permalinkHazard', hazardId);
            ConfigUtils.setConfigProp('permalinkAnnotation', annotationId);
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
        reset: resetControls
    })(MapPermaLinkPage);
