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

const LocaleUtils = require('../../MapStore2/web/client/utils/LocaleUtils');

class EarlyWarning extends React.Component {
    static contextTypes = {
        messages: PropTypes.object
    };

    render() {
        return (
            <div id="decat-early-warning" className="decat-accordion" >
                <Accordion defaultActiveKey="1">
                    <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.alerts")}</div></span>} Key="1" collapsible>
                        Alerts
                    </Panel>
                    <Panel header={<span><div className="decat-panel-header">{LocaleUtils.getMessageById(this.context.messages, "decatwarning.filter")}</div></span>} eventKey="2" collapsible>
                        Filter
                    </Panel>
                </Accordion>
            </div>
        );
    }
}

module.exports = {
    EarlyWarningPlugin: assign(EarlyWarning,
    {
        DrawerMenu: {
            name: 'early-warning',
            position: 1,
            glyph: "1-layer",
            title: 'earlywarning',
            buttonConfig: {
                buttonClassName: "square-button no-border",
                tooltip: "earlywarning"
            },
            priority: 1
        }
    })
};
