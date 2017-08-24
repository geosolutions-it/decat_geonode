/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const {Promise} = require('es6-promise');

const UploadUtils = {
    getFormData: (file, fileType) => {
        return UploadUtils[`${fileType}Form`] && UploadUtils[`${fileType}Form`](file);
    },
    layerForm: (file) => {
        let data = new FormData();
        data.append("base_file", file);
        data.append("permissions", '{"users":{"AnonymousUser":["view_resourcebase","download_resourcebase"]},"groups":{}}');
        data.append("zip_file", file);
        data.append("charset", "UTF-8");
        return data;
    },
    documentForm: (file) => {
        let data = new FormData();
        data.append("title", file.name);
        data.append("doc_file", file);
        data.append("permissions", '{"users":{"AnonymousUser":["view_resourcebase","download_resourcebase"]},"groups":{}}');
        data.append("no__redirect", true);
        return data;
    }
};

module.exports = UploadUtils;
