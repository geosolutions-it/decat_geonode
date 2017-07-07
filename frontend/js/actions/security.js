/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const axios = require('../../MapStore2/web/client/libs/ajax');

const USER_INFO_LOADED = 'USER_INFO_LOADED';
const USER_INFO_ERROR = 'USER_INFO_ERROR';

function userInfoLoaded(user) {
    return {
        type: USER_INFO_LOADED,
        user
    };
}

function userInfoError(entity, e) {
    return {
        type: USER_INFO_ERROR,
        error: e
    };
}

function loadUserInfo(url = '/decat/api/user/') {
    return (dispatch) => {
        return axios.get(url).then((response) => {
            if (typeof response.data === 'object') {
                if (response.data.success) {
                    dispatch(userInfoLoaded({
                        user: response.data.data,
                        token: response.data.data.token.token
                    }));
                } else {
                    dispatch(userInfoLoaded({
                        user: {
                            name: 'anonymous'
                        }
                    }));
                }
            } else {
                try {
                    JSON.parse(response.data);
                } catch (e) {
                    dispatch(userInfoError('User Info error: ' + e.message));
                }
            }
        }).catch((e) => {
            dispatch(userInfoError(e));
        });
    };
}


module.exports = {USER_INFO_LOADED, USER_INFO_ERROR,
    loadUserInfo};
