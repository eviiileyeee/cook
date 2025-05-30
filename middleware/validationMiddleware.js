/**
 * Validation Middleware
 * Provides request validation middleware functions
 */

const { createErrorResponse } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Validate recipe ID parameter
 */
const validateRecipeId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    return res.status(400).json(
      createErrorResponse('Valid recipe ID is required', 400)
    );
  }
  
  req.params.id = parseInt(id);
  next();
};

/**
 * Validate ingredients query parameter
 */
const validateIngredients = (req, res, next) => {
  const { items } = req.query;
  
  if (!items || typeof items !== 'string' || items.trim().length === 0) {
    return res.status(400).json(
      createErrorResponse('Items parameter with ingredients is required', 400)
    );
  }
  
  // Clean and validate ingredients
  const ingredients = items
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);
  
  if (ingredients.length === 0) {
    return res.status(400).json(
      createErrorResponse('At least one valid ingredient is required', 400)
    );
  }
  
  req.validatedIngredients = ingredients;
  next();
};

/**
 * Validate search query parameter
 */
const validateSearchQuery = (req, res, next) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json(
      createErrorResponse('Search query parameter (q) is required', 400)
    );
  }
  
  if (q.trim().length < 2) {
    return res.status(400).json(
      createErrorResponse('Search query must be at least 2 characters long', 400)
    );
  }
  
  req.query.q = q.trim();
  next();
};

/**
 * Validate limit parameter
 */
const validateLimit = (req, res, next) => {
  let { limit } = req.query;
  
  if (limit) {
    limit = parseInt(limit);
    
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json(
        createErrorResponse('Limit must be a positive number', 400)
      );
    }
    
    if (limit > 100) {
      return res.status(400).json(
        createErrorResponse('Limit cannot exceed 100', 400)
      );
    }
    
    req.query.limit = limit;
  }
  
  next();
};

/**
 * Validate servings parameter
 */
const validateServings = (req, res, next) => {
  let { servings } = req.query;
  
  if (servings) {
    servings = parseInt(servings);
    
    if (isNaN(servings) || servings <= 0) {
      return res.status(400).json(
        createErrorResponse('Servings must be a positive number', 400)
      );
    }
    
    if (servings > 50) {
      return res.status(400).json(
        createErrorResponse('Servings cannot exceed 50', 400)
      );
    }
    
    req.query.servings = servings;
  }
  
  next();
};

/**
 * Validate multiple recipe IDs in request body
 */
const validateMultipleRecipeIds = (req, res, next) => {
  const { recipeIds } = req.body;
  
  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return res.status(400).json(
      createErrorResponse('Recipe IDs array is required', 400)
    );
  }
  
  if (recipeIds.length > 20) {
    return res.status(400).json(
      createErrorResponse('Cannot process more than 20 recipes at once', 400)
    );
  }
  
  // Validate each recipe ID
  const invalidIds = recipeIds.filter(id => isNaN(parseInt(id)) || parseInt(id) <= 0);
  if (invalidIds.length > 0) {
    return res.status(400).json(
      createErrorResponse('All recipe IDs must be valid positive numbers', 400)
    );
  }
  
  req.body.recipeIds = recipeIds.map(id => parseInt(id));
  next();
};

/**
 * Validate category parameter
 */
const validateCategory = (req, res, next) => {
  const { category } = req.params;
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json(
      createErrorResponse('Category parameter is required', 400)
    );
  }
  
  req.params.category = category.trim().toLowerCase();
  next();
};

/**
 * Validate request body exists
 */
const validateRequestBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json(
      createErrorResponse('Request body is required', 400)
    );
  }
  
  next();
};

/**
 * Log validation errors
 */
const logValidationError = (error, req) => {
  logger.error('Validation error:', {
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query,
    body: req.body,
    error: error.message
  });
};

module.exports = {
  validateRecipeId,
  validateIngredients,
  validateSearchQuery,
  validateLimit,
  validateServings,
  validateMultipleRecipeIds,
  validateCategory,
  validateRequestBody,
  logValidationError
};