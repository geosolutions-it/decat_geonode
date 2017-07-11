/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
let currentUser;
const rules = {
    addevent: (user) => user && user.user && user.user.roles && user.user.roles.indexOf('event-operator') !== -1
};

module.exports = {
    setUserInfo: (user) => {
        currentUser = user;
    },
    isAuthorized: (action) => {
        return rules[action] && rules[action](currentUser) || false;
    }
};
