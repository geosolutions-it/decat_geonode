/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
    plugins: {
        MousePositionPlugin: require('../MapStore2/web/client/plugins/MousePosition'),
        EarlyWarningPlugin: require('./plugins/EarlyWarning'),
        ImpactAssesmentPlugin: require('./plugins/ImpactAssessment'),
        EmergencyManagerPlugin: require('./plugins/EmergencyManager'),
        PrintPlugin: require('../MapStore2/web/client/plugins/Print'),
        IdentifyPlugin: require('../MapStore2/web/client/plugins/Identify'),
        BackgroundSwitcherPlugin: require('../MapStore2/web/client/plugins/BackgroundSwitcher'),
        MeasurePlugin: require('../MapStore2/web/client/plugins/Measure'),
        MapPlugin: require('../MapStore2/web/client/plugins/Map'),
        ToolbarPlugin: require('../MapStore2/web/client/plugins/Toolbar'),
        DrawerMenuPlugin: require('./plugins/DecatDrawer'),
        // ShapeFilePlugin: require('../MapStore2/web/client/plugins/ShapeFile'),
        // SnapshotPlugin: require('../MapStore2/web/client/plugins/Snapshot'),
        SettingsPlugin: require('../MapStore2/web/client/plugins/Settings'),
        ExpanderPlugin: require('../MapStore2/web/client/plugins/Expander'),
        SearchPlugin: require('../MapStore2/web/client/plugins/Search'),
        ScaleBoxPlugin: require('../MapStore2/web/client/plugins/ScaleBox'),
        LocatePlugin: require('../MapStore2/web/client/plugins/Locate'),
        ZoomInPlugin: require('../MapStore2/web/client/plugins/ZoomIn'),
        ZoomOutPlugin: require('./plugins/ZoomOut'),
        ZoomAllPlugin: require('../MapStore2/web/client/plugins/ZoomAll'),
        FullScreenPlugin: require('../MapStore2/web/client/plugins/FullScreen'),
        MapLoadingPlugin: require('../MapStore2/web/client/plugins/MapLoading'),
        HelpPlugin: require('../MapStore2/web/client/plugins/Help'),
        HelpLinkPlugin: require('../MapStore2/web/client/plugins/HelpLink'),
        HomePlugin: require('../MapStore2/web/client/plugins/Home'),
        MetadataExplorerPlugin: require('../MapStore2/web/client/plugins/MetadataExplorer'),
        OmniBarPlugin: require('../MapStore2/web/client/plugins/OmniBar'),
        GridContainerPlugin: require('../MapStore2/web/client/plugins/GridContainer'),
        BurgerMenuPlugin: require('../MapStore2/web/client/plugins/BurgerMenu'),
        UndoPlugin: require('../MapStore2/web/client/plugins/History'),
        RedoPlugin: require('../MapStore2/web/client/plugins/History'),
        MapsPlugin: require('../MapStore2/web/client/plugins/Maps'),
        MapSearchPlugin: require('../MapStore2/web/client/plugins/MapSearch'),
        LanguagePlugin: require('../MapStore2/web/client/plugins/Language'),
        ManagerPlugin: require('../MapStore2/web/client/plugins/manager/Manager'),
        UserManagerPlugin: require('../MapStore2/web/client/plugins/manager/UserManager'),
        GroupManagerPlugin: require('../MapStore2/web/client/plugins/manager/GroupManager'),
        RulesManagerPlugin: require('../MapStore2/web/client/plugins/manager/RulesManager'),
        ManagerMenuPlugin: require('../MapStore2/web/client/plugins/manager/ManagerMenu'),
        RedirectPlugin: require('../MapStore2/web/client/plugins/Redirect'),
        SharePlugin: require('../MapStore2/web/client/plugins/Share'),
        SavePlugin: require('./plugins/Save'),
        SaveAsPlugin: require('./plugins/SaveAs'),
        CreateNewMapPlugin: require('../MapStore2/web/client/plugins/CreateNewMap'),
        QueryPanelPlugin: require('../MapStore2/web/client/plugins/QueryPanel'),
        FeatureGridPlugin: require('../MapStore2/web/client/plugins/FeatureGrid'),
        WFSDownloadPlugin: require('../MapStore2/web/client/plugins/WFSDownload'),
        TutorialPlugin: require('../MapStore2/web/client/plugins/Tutorial'),
        ThemeSwitcherPlugin: require('../MapStore2/web/client/plugins/ThemeSwitcher'),
        ScrollTopPlugin: require('../MapStore2/web/client/plugins/ScrollTop'),
        GoFull: require('../MapStore2/web/client/plugins/GoFull'),
        GlobeViewSwitcherPlugin: require('../MapStore2/web/client/plugins/GlobeViewSwitcher'),
        BackgroundSelectorPlugin: require('../MapStore2/web/client/plugins/BackgroundSelector'),
        SearchServicesConfigPlugin: require('../MapStore2/web/client/plugins/SearchServicesConfig'),
        VersionPlugin: require('../MapStore2/web/client/plugins/Version'),
        CookiePlugin: require('../MapStore2/web/client/plugins/Cookie'),
        NotificationsPlugin: require('../MapStore2/web/client/plugins/Notifications'),
        RightTOCPanelPlugin: require('./plugins/RightTOCPanel'),
       CurrentIntervalFooterPlugin: require('./plugins/CurrentIntervalFooter')
        // AnnotationsPlugin: require('../MapStore2/web/client/plugins/Annotations')
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('../MapStore2/web/client/components/data/identify/SwipeHeader')
    }
};
