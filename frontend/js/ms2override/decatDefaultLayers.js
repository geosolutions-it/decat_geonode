/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
module.exports = [
    {
        group: "Alerts",
        hideLoading: true,
        id: "editalert",
        style: {
            html: {
                className: "fa fa-3x icon-eq d-text-warning",
                iconAnchor: [
                    18,
                    18
                ],
                iconSize: [
                    36,
                    36
                ]
            }
        },
        styleName: "marker",
        title: "New/Edit",
        type: "vector",
        visibility: true
    },
    {
        group: "Alerts",
        hideLoading: true,
        id: "selectedalerts",
        style: {
            html: {
                className: "fa fa-3x icon-eq d-text-warning",
                iconAnchor: [
                    18,
                    18
                ],
                iconSize: [
                    36,
                    36
                ]
            }
        },
        styleName: "marker",
        title: "Selected",
        type: "vector",
        visibility: true
    },
    {
        group: "Alerts",
        hideLoading: true,
        id: "alerts",
        style: {
            html: {
                className: "fa fa-3x icon-eq d-text-warning",
                iconAnchor: [
                    18,
                    18
                ],
                iconSize: [
                    36,
                    36
                ]
            }
        },
        styleName: "marker",
        title: "Current",
        type: "vector",
        visibility: true
    }
];
