/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */

const logger = require('../utils/logger');
const { AppError, createErrorResponse } = require('../utils/errorHandler');

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.error(`Error ${err.message}`, err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new AppError(message, 400);
  }

  // YouTube API errors
  if (err.response && err.response.status === 403) {
    const message = 'YouTube API quota exceeded or invalid API key';
    error = new AppError(message, 403);
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    const message = 'External service unavailable';
    error = new AppError(message, 503);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json(createErrorResponse(
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : null
  ));
};

module.exports = errorMiddleware;