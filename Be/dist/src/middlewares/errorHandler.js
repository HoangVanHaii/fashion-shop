"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_1 = require("../utils/appError");
const errorHandler = (err, req, res, next) => {
    if (err instanceof appError_1.AppError && err.isOperational) {
        return res.status(err.status).json({
            success: false,
            message: err.message
        });
    }
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
};
exports.errorHandler = errorHandler;
