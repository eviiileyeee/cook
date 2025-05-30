/**
 * Input validation utilities
 * Provides common validation functions for API endpoints
 */

/**
 * Validates and sanitizes ingredient list
 */
const validateIngredients = (ingredientsString) => {
  if (!ingredientsString || typeof ingredientsString !== 'string') {
    throw new Error('Ingredients must be provided as a comma-separated string');
  }

  const ingredients = ingredientsString
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(item => item.length > 0);

  if (ingredients.length === 0) {
    throw new Error('At least one ingredient must be provided');
  }

  if (ingredients.length > 20) {
    throw new Error('Maximum 20 ingredients allowed');
  }

  return ingredients;
};

/**
 * Validates recipe ID
 */
const validateRecipeId = (id) => {
  if (!id) {
    throw new Error('Recipe ID is required');
  }

  const numericId = parseInt(id, 10);
  if (isNaN(numericId) || numericId <= 0) {
    throw new Error('Recipe ID must be a positive integer');
  }

  return numericId;
};

/**
 * Validates YouTube search query
 */
const validateYouTubeQuery = (query) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query is required');
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2) {
    throw new Error('Search query must be at least 2 characters long');
  }

  if (trimmedQuery.length > 100) {
    throw new Error('Search query must be less than 100 characters');
  }

  return trimmedQuery;
};

/**
 * Validates pagination parameters
 */
const validatePagination = (page, limit) => {
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;

  if (isNaN(parsedPage) || parsedPage <= 0) {
    throw new Error('Page must be a positive integer');
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 50) {
    throw new Error('Limit must be a positive integer between 1 and 50');
  }

  return { page: parsedPage, limit: parsedLimit };
};

module.exports = {
  validateIngredients,
  validateRecipeId,
  validateYouTubeQuery,
  validatePagination
};