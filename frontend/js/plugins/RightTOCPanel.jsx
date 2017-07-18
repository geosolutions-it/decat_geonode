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
const {connect} = require('react-redux');
const {Button, Glyphicon, Panel} = require('react-bootstrap');
const Sidebar = require('react-sidebar').default;
const {toggleControl} = require('../../MapStore2/web/client/actions/controls');
const Message = require('../../MapStore2/web/client/plugins/locale/Message');
const Toc = require('../../MapStore2/web/client/plugins/TOC');
class RightPanel extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        width: PropTypes.number,
        items: PropTypes.array
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        width: 300,
        show: false
    }
    renderContent = () => {
        return (
                <div className="alerts-right-toc">
                    <Panel header={<Message msgId={Toc.TOCPlugin.DrawerMenu.title}/>} eventKey="right-toc">
                        <Toc.TOCPlugin/>
                    </Panel>
                </div>);
    }
    render() {
        if (this.props.show) {
            window.setTimeout( function() {
                document.getElementsByTagName("body")[0].setAttribute('decat-toc-container', 'toggled');
            }, 10);
        } else {
            window.setTimeout( function() {
                document.getElementsByTagName("body")[0].removeAttribute('decat-toc-container');
            }, 10);
        }
        return (
        <Sidebar styles={{
            sidebar: {
                zIndex: 999,
                width: this.props.width,
                transition: 'transform .8s ease-out',
                WebkitTransition: '-webkit-transform .5s ease-out',
                backgroundColor: '#f2f2f2'
            },
            overlay: {
                zIndex: 1021,
                opacity: 0
            },
            root: {
                top: "125px",
                left: "auto",
                width: "0",
                overflow: 'visible'
            }
        }}
            pullRight
            sidebarClassName="nav-menu-mission"
            docked={this.props.show}
            sidebar={this.renderContent()}>
           <div/>
        </Sidebar>);
    }
}


class ToggleTocRightPanel extends React.Component {
    static propTypes = {
       onToggle: PropTypes.func,
       active: PropTypes.bool
    };
    static defaultProps = {
        onToggle: () => {},
        active: false
    }
    render() {
        return (
            <Button
                active={this.props.active}
                onClick={this.props.onToggle}
                id="rightpanel-button"
                className="square-button"
                bsStyle="primary"
            ><Glyphicon glyph="1-layer"/></Button>);
    }
}
const RightTOCPanelPlugin = connect((state) => ({
                show: state.controls && state.controls.rightpanel && state.controls.rightpanel.enabled || false}))(RightPanel);
module.exports = {
    RightTOCPanelPlugin: assign(RightTOCPanelPlugin, {
        OmniBar: {
            name: 'rigthpanel',
            position: 2,
            tool: connect((state) => ({
        active: state.controls && state.controls.rightpanel && state.controls.rightpanel.enabled || false
    }), {
        onToggle: toggleControl.bind(null, 'rightpanel', 'enabled')
    })(ToggleTocRightPanel),
            tools: [RightTOCPanelPlugin],
            priority: 1
        }
    }),
    reducers: assign({}, Toc.reducers),
    epics: assign({}, Toc.epics)

};
