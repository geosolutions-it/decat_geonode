/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {USER_INFO_LOADED, USER_INFO_ERROR} = require('../actions/security');

const assign = require('object-assign');
const SecurityUtils = require('../utils/SecurityUtils');
const ConfigUtils = require('../ms2override/ConfigUtils');

function security(state = null, action) {
    switch (action.type) {
    case USER_INFO_LOADED:
        SecurityUtils.setUserInfo(action.user);
        return assign({}, state, action.user, {currentRole: action.user.user.roles && action.user.user.roles[0]});
    case USER_INFO_ERROR:
        return assign({}, state, {
            errorCause: action.error
        });
    default:
        return state;
    }
}

module.exports = security;
