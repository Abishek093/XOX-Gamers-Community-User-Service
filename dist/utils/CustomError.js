"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor(error, statusCode) {
        console.log("error in Custom error", error, statusCode);
        let message;
        if (error instanceof Error) {
            message = error.message;
        }
        else if (error && typeof error === 'object' && 'message' in error) {
            message = String(error.message);
        }
        else if (typeof error === 'string') {
            message = error;
        }
        else {
            message = "Oops, something went wrong!";
        }
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = CustomError;
