/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const PropTypes = require('prop-types');
const {Glyphicon, FormControl, Button} = require('react-bootstrap');

class CoordinatesInput extends React.Component {
    static propTypes = {
        drawEnabled: PropTypes.bool,
        point: PropTypes.object,
        onChange: PropTypes.func,
        onToggle: PropTypes.func
    };

    static defaultProps = {
        drawEnabled: true,
        point: {},
        onChange: () => {},
        onToggle: () => {}
    };

    state = {
        point: ''
    }

    componentWillMount() {
        this.setState({
            point: this.getPoint()
        });
    }


    componentWillUpdate(newProps) {
        if (this.props.drawEnabled && !newProps.drawEnabled) {
            this.setState({
                point: this.getPoint()
            });
        }
    }

    getPoint = () => {
        if (this.props.point) {
            let latDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};
            let lngDFormat = {style: "decimal", minimumIntegerDigits: 1, maximumFractionDigits: 6, minimumFractionDigits: 6};

            return new Intl.NumberFormat(undefined, latDFormat).format(Math.abs(this.props.point.lat)) + '°' + (Math.sign(this.props.point.lat) >= 0 ? 'N' : 'S') + ' ' +
                new Intl.NumberFormat(undefined, lngDFormat).format(Math.abs(this.props.point.lng)) + '°' + (Math.sign(this.props.point.lng) >= 0 ? 'E' : 'W');
        }
        return '';
    };

    getParsedLatLng = (latString, lngString) => {
        const lat = parseFloat(latString);
        const lng = parseFloat(lngString);
        return !isNaN(lat) && !isNaN(lng) && this.inRange(lat, lng) ? {lat, lng} : null;
    };

    getLatLng = (value) => {
        const isLat = value.match(/°N|°S/);
        const isLng = value.match(/°E|°W/);

        const isValidNSWE = isLat && isLng && true || null;

        if (isValidNSWE) {
            const split = isLat[0] === '°N' ? value.split('°N') : value.split('°S');
            const latReplace = split[0].replace(/°N|°S|\s/g, '');
            const latString = isLat[0] === '°N' ? latReplace : '-' + latReplace;
            const lngReplace = split[1].replace(/°E|°W|\s/g, '');
            const lngString = isLng[0] === '°E' ? lngReplace : '-' + lngReplace;
            const latLng = this.getParsedLatLng(latString, lngString);
            if (latLng) {
                this.props.onChange(latLng);
            }
        } else {
            const values = value.split(' ');
            const isValid = values.length === 2 && !isNaN(parseFloat(values[0])) && !isNaN(parseFloat(values[1]));

            if (isValid) {
                const latLng = this.getParsedLatLng(values[0], values[1]);
                if (latLng) {
                    this.props.onChange(latLng);
                }
            }
        }
    };

    render() {
        return (
            <div className="mapstore-coordinates-input input-group">
                <FormControl disabled={this.props.drawEnabled} onChange={(e) => {
                    this.getLatLng(e.target.value);
                    this.setState({
                        point: e.target.value
                    });
                }}
                value={this.props.drawEnabled ? this.getPoint() : this.state.point}/>
                <div className="input-group-btn">
                    <Button active={this.props.drawEnabled} onClick={() => { this.props.onToggle(); }}><Glyphicon glyph="map-marker"/></Button>
                </div>
            </div>
        );
    }

    inRange = (lat, lng) => {
        return lat <= 90 && lat >= -90 && lng >= -180 && lng <= 180;
    };
}

module.exports = CoordinatesInput;
