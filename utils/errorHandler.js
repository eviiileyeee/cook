/**
 * Error handling utilities
 * Provides consistent error creation and handling across the application
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a standardized error response object
 */
const createErrorResponse = (message, statusCode = 500, details = null) => {
  return {
    success: false,
    error: {
      message,
      statusCode,
      details,
      timestamp: new Date().toISOString()
    }
  };
};

/**
 * Wraps async route handlers to catch errors automatically
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Validates required parameters and throws error if missing
 */
const validateRequiredParams = (params, requiredFields) => {
  const missingFields = requiredFields.filter(field => !params[field]);
  
  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required parameters: ${missingFields.join(', ')}`,
      400
    );
  }
};

module.exports = {
  AppError,
  createErrorResponse,
  catchAsync,
  validateRequiredParams
};