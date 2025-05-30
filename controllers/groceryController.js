/**
 * Grocery Controller
 * Handles HTTP requests for grocery list generation
 */

const groceryService = require('../services/groceryService');
const { createErrorResponse } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class GroceryController {
  /**
   * Generate grocery list for a recipe
   * GET /grocery-list?recipeId=123
   */
  async getGroceryList(req, res, next) {
    try {
      const { recipeId, servings } = req.query;

      if (!recipeId || isNaN(parseInt(recipeId))) {
        return res.status(400).json(
          createErrorResponse('Valid recipe ID is required', 400)
        );
      }

      const targetServings = servings ? parseInt(servings) : null;
      
      if (servings && (isNaN(targetServings) || targetServings <= 0)) {
        return res.status(400).json(
          createErrorResponse('Servings must be a positive number', 400)
        );
      }

      logger.info(`Generating grocery list for recipe ID: ${recipeId}`, 
        targetServings ? `for ${targetServings} servings` : '');
      
      const groceryList = await groceryService.generateGroceryList(
        parseInt(recipeId), 
        targetServings
      );

      res.json({
        success: true,
        data: groceryList,
        message: 'Grocery list generated successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate grocery list for multiple recipes
   * POST /grocery-list/multiple
   * Body: { recipeIds: [1, 2, 3], servings: { 1: 2, 2: 4, 3: 1 } }
   */
  async getMultipleGroceryList(req, res, next) {
    try {
      const { recipeIds, servings = {} } = req.body;

      if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
        return res.status(400).json(
          createErrorResponse('Array of recipe IDs is required', 400)
        );
      }

      // Validate recipe IDs
      const invalidIds = recipeIds.filter(id => isNaN(parseInt(id)));
      if (invalidIds.length > 0) {
        return res.status(400).json(
          createErrorResponse('All recipe IDs must be valid numbers', 400)
        );
      }

      logger.info(`Generating combined grocery list for recipes: ${recipeIds.join(', ')}`);
      
      const groceryList = await groceryService.generateMultipleGroceryList(
        recipeIds.map(id => parseInt(id)), 
        servings
      );

      res.json({
        success: true,
        data: groceryList,
        message: 'Combined grocery list generated successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get grocery list by category
   * GET /grocery-list/:recipeId/by-category
   */
  async getGroceryListByCategory(req, res, next) {
    try {
      const { recipeId } = req.params;
      const { servings } = req.query;

      if (!recipeId || isNaN(parseInt(recipeId))) {
        return res.status(400).json(
          createErrorResponse('Valid recipe ID is required', 400)
        );
      }

      const targetServings = servings ? parseInt(servings) : null;

      logger.info(`Generating categorized grocery list for recipe ID: ${recipeId}`);
      
      const groceryList = await groceryService.generateGroceryListByCategory(
        parseInt(recipeId), 
        targetServings
      );

      res.json({
        success: true,
        data: groceryList,
        message: 'Categorized grocery list generated successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Check ingredient availability
   * POST /grocery-list/check-availability
   * Body: { ingredients: ["eggs", "milk", "cheese"] }
   */
  async checkIngredientAvailability(req, res, next) {
    try {
      const { ingredients } = req.body;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json(
          createErrorResponse('Array of ingredients is required', 400)
        );
      }

      logger.info(`Checking availability for ingredients: ${ingredients.join(', ')}`);
      
      const availability = await groceryService.checkIngredientAvailability(ingredients);

      res.json({
        success: true,
        data: availability,
        message: 'Ingredient availability checked successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GroceryController();