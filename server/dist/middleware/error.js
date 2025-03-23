"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const mongoose_1 = require("mongoose");
const errorHandler = (err, req, res, _next) => {
    const error = { ...err };
    error.message = err.message;
    // Log error for debugging
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        errors: err.errors
    });
    // Mongoose validation error
    if (err instanceof mongoose_1.Error.ValidationError) {
        error.message = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
        error.statusCode = 400;
    }
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.statusCode = 404;
    }
    // Mongoose duplicate key
    if (err.name === 'MongoError' && error.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }
    // Send error response
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        details: process.env.NODE_ENV === 'development' ? {
            name: err.name,
            code: err.code,
            errors: err.errors
        } : undefined
    });
};
exports.errorHandler = errorHandler;
