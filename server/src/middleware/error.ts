import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: { [key: string]: { message: string } };
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
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
  if (err instanceof MongooseError.ValidationError) {
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
