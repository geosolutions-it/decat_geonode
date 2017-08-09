/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
module.exports = {
    "event-operator": [{
        "type": "vector",
        "id": "archived_alerts",
        "name": "archived_alerts",
        "title": "Archived",
        "group": "Alerts",
        "visibility": false,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    },
   {
            "type": "vector",
            "name": "editalert",
            "id": "editalert",
            "title": "New/Edit",
            "group": "Alerts",
            "visibility": true,
            "styleName": "marker",
            "hideLoading": true,
            "style": {
                "html": {
                "className": "fa fa-3x icon-eq d-text-warning",
                "iconSize": [36, 36],
                "iconAnchor": [18, 18]
            }
        }
    },
    {
        "type": "vector",
        "id": "selectedalerts",
        "name": "selectedalerts",
        "title": "Selected",
        "group": "Alerts",
        "visibility": true,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    },
    {
        "type": "vector",
        "id": "alerts",
        "name": "alerts",
        "title": "Current",
        "group": "Alerts",
        "visibility": true,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    },
    {
        "type": "vector",
        "id": "promoted_alerts",
        "name": "promoted_alerts",
        "title": "Promoted",
        "group": "Alerts",
        "visibility": false,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    }],
    "impact-assessor": [ {
        "type": "vector",
        "id": "selectedalerts",
        "name": "selectedalerts",
        "title": "Selected",
        "group": "Hazards",
        "visibility": true,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    },
    {
        "type": "vector",
        "id": "alerts",
        "name": "alerts",
        "title": "Current",
        "group": "Hazards",
        "visibility": true,
        "styleName": "marker",
        "hideLoading": true,
        "style": {
            "html": {
               "className": "fa fa-3x icon-eq d-text-warning",
               "iconSize": [36, 36],
               "iconAnchor": [18, 18]
            }
        }
    }]
};
