/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Glyphicon, Tooltip, OverlayTrigger, Button, FormGroup} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');

const PropTypes = require('prop-types');

class ZoomToAnnotation extends React.Component {
    static propTypes = {
        annotation: PropTypes.object,
        onZoom: PropTypes.func
    };

    state = {copied: false};

    render() {
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom" style={{zIndex: 2001}}>
             <Message msgId="annotation.zoomToTooltip"/>
         </Tooltip>);
        return (<FormGroup>
                        <div className="input-group">
                            <OverlayTrigger placement="bottom" overlay={tooltip}>
                                <Button className="square-button-md" bsStyle="primary" bsSize="small" onClick={this.zoom}>
                                    <Glyphicon glyph="zoom-to"/>
                                </Button>
                            </OverlayTrigger>
                        </div>
                    </FormGroup>
                );
    }

    zoom = () => {
        this.props.onZoom({
            x: this.props.annotation.geometry.coordinates[0],
            y: this.props.annotation.geometry.coordinates[1]
        }, 18);
    }
}

module.exports = ZoomToAnnotation;
