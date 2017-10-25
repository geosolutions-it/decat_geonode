/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {Glyphicon, Tooltip, OverlayTrigger, Button, FormControl, FormGroup} = require('react-bootstrap');
const Message = require('../../MapStore2/web/client/components/I18N/Message');
const CopyToClipboard = require('react-copy-to-clipboard');

const PropTypes = require('prop-types');

class Permalink extends React.Component {
    static propTypes = {
        hazard: PropTypes.string,
        map: PropTypes.string,
        annotation: PropTypes.object,
        baseUrl: PropTypes.string
    };

    state = {copied: false};

    getPermalink = () => {
        return this.props.annotation && this.props.annotation.properties ? this.props.baseUrl + (this.props.annotation.properties.external ? ('/permalink/hazard/' + this.props.hazard) : ('/permalink/map/' + this.props.map) + '/' + this.props.hazard) + '/' + (this.props.annotation.id || this.props.annotation.properties.id) : "";
    };

    render() {
        const tooltip = (<Tooltip placement="bottom" className="in" id="tooltip-bottom" style={{zIndex: 2001}}>
             {this.state.copied ? <Message msgId="share.msgCopiedUrl"/> : <Message msgId="share.msgToCopyUrl"/>}
         </Tooltip>);
        const permalink = this.getPermalink();
        return (<FormGroup>
                        <div className="input-group">
                            <FormControl onFocus={ev => ev.target.select()} value={permalink} readOnly/>
                            <span className="input-group-addon"><OverlayTrigger placement="bottom" overlay={tooltip}>
                                    <CopyToClipboard text={permalink} onCopy={ () => this.setState({copied: true}) } >
                                        <Button className="buttonCopyTextArea" bsStyle="primary" bsSize="small">
                                            <Glyphicon glyph="copy" onMouseLeave={() => {this.setState({copied: false}); }} />
                                        </Button>
                                    </CopyToClipboard>
                                </OverlayTrigger></span>
                        </div>
                    </FormGroup>
                );
    }
}

module.exports = Permalink;
