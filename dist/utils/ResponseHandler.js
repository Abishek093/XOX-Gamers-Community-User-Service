"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = void 0;
const handleResponse = (res, statusCode, message, data) => {
    res.status(statusCode).json(Object.assign({ status: statusCode >= 400 ? 'error' : 'success', message }, (data && typeof data === 'object' ? { data } : {})));
};
exports.handleResponse = handleResponse;
