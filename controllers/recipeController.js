/**
 * Recipe Controller with Gemini AI Integration
 * Handles HTTP requests for recipe-related endpoints
 */

const recipeService = require('../services/recipeService');
const { validateIngredients } = require('../utils/validators');
const { createErrorResponse } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class RecipeController {
  /**
   * Get recipes by ingredients using Gemini AI
   * GET /recipes/by-ingredients?items=eggs,tomato,cheese&limit=10
   */
  async getRecipesByIngredients(req, res, next) {
    try {
      const { items, limit = 10, cuisine, difficulty } = req.query;

      if (!items) {
        return res.status(400).json(
          createErrorResponse('Items parameter is required', 400)
        );
      }

      const ingredients = validateIngredients(items);
      if (ingredients.length === 0) {
        return res.status(400).json(
          createErrorResponse('Valid ingredients are required', 400)
        );
      }

      logger.info(`Searching recipes for ingredients: ${ingredients.join(', ')}`);
      
      // Get recipes from Gemini AI
      const recipesData = await recipeService.findRecipesByIngredients(
        ingredients, 
        parseInt(limit)
      );

      // Apply additional filters if provided
      let filteredRecipes = recipesData.recipes;
      
      if (cuisine && cuisine !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
        );
      }

      if (difficulty && difficulty !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe => 
          recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
      }

      // Update the response with filtered results
      const finalResponse = {
        searchedIngredients: recipesData.searchedIngredients,
        totalFound: filteredRecipes.length,
        recipes: filteredRecipes
      };

      res.json({
        success: true,
        data: {
          ingredients: ingredients,
          recipes: finalResponse
        },
        message: `Found ${finalResponse.totalFound} recipes matching your ingredients`
      });

    } catch (error) {
      logger.error('Error in getRecipesByIngredients:', error);
      next(error);
    }
  }

  /**
   * Get recipe instructions by ID using Gemini AI
   * GET /recipes/:id/instructions
   */
  async getRecipeInstructions(req, res, next) {
  try {
    const { name } = req.params;

    if (!name || typeof name !== 'string') {
      return res.status(400).json(
        createErrorResponse('Valid recipe name is required', 400)
      );
    }

    logger.info(`Fetching instructions for recipe name: ${name}`);

    const instructions = await recipeService.getRecipeInstructions(name);

    res.json({
      success: true,
      data: instructions,
      message: 'Recipe instructions retrieved successfully'
    });

  } catch (error) {
    logger.error('Error in getRecipeInstructions:', error);
    next(error);
  }
}


  /**
   * Get all recipes using Gemini AI
   * GET /recipes?limit=20&cuisine=Italian&difficulty=easy
   */
  async getAllRecipes(req, res, next) {
    try {
      const { limit = 20, cuisine, difficulty, sortBy = 'rating' } = req.query;
      
      logger.info('Fetching all recipes with filters:', { cuisine, difficulty, sortBy });
      
      const recipes = await recipeService.getAllRecipes({
        limit: parseInt(limit),
        cuisine,
        difficulty
      });

      // Apply sorting
      let sortedRecipes = [...recipes];
      switch (sortBy) {
        case 'rating':
          sortedRecipes.sort((a, b) => b.rating - a.rating);
          break;
        case 'cookingTime':
          sortedRecipes.sort((a, b) => a.cookingTime - b.cookingTime);
          break;
        case 'name':
          sortedRecipes.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          sortedRecipes.sort((a, b) => b.rating - a.rating);
      }

      res.json({
        success: true,
        data: {
          count: sortedRecipes.length,
          recipes: sortedRecipes,
          filters: { cuisine, difficulty, sortBy }
        },
        message: 'Recipes retrieved successfully'
      });

    } catch (error) {
      logger.error('Error in getAllRecipes:', error);
      next(error);
    }
  }

  /**
   * Get recipe by ID using Gemini AI
   * GET /recipes/:id
   */
  async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Valid recipe ID is required', 400)
        );
      }

      logger.info(`Fetching recipe with ID: ${id}`);
      
      const recipe = await recipeService.getRecipeById(parseInt(id));

      res.json({
        success: true,
        data: recipe,
        message: 'Recipe retrieved successfully'
      });

    } catch (error) {
      logger.error('Error in getRecipeById:', error);
      next(error);
    }
  }

  /**
   * Search recipes by name using Gemini AI
   * GET /recipes/search?q=omelet&limit=10
   */
  async searchRecipes(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Search query is required', 400)
        );
      }

      logger.info(`Searching recipes for query: ${q}`);
      
      const recipes = await recipeService.searchRecipesByName(q.trim(), parseInt(limit));

      res.json({
        success: true,
        data: {
          query: q.trim(),
          count: recipes.length,
          recipes: recipes
        },
        message: `Found ${recipes.length} recipes matching "${q}"`
      });

    } catch (error) {
      logger.error('Error in searchRecipes:', error);
      next(error);
    }
  }

  /**
   * Get recipe suggestions based on dietary preferences
   * GET /recipes/suggestions?dietary=vegetarian&cuisine=Italian&limit=5
   */
  async getRecipeSuggestions(req, res, next) {
    try {
      const { dietary, cuisine, difficulty, limit = 5 } = req.query;

      logger.info('Getting recipe suggestions with preferences:', { dietary, cuisine, difficulty });

      // Create a virtual ingredient list for suggestions
      const suggestionIngredients = ['common pantry items'];
      
      const recipesData = await recipeService.findRecipesByIngredients(
        suggestionIngredients, 
        parseInt(limit)
      );

      // Filter based on preferences if provided
      let filteredRecipes = recipesData.recipes;

      if (dietary) {
        // This would be enhanced based on dietary preferences
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.tags.some(tag => tag.toLowerCase().includes(dietary.toLowerCase()))
        );
      }

      if (cuisine && cuisine !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
        );
      }

      if (difficulty && difficulty !== 'all') {
        filteredRecipes = filteredRecipes.filter(recipe =>
          recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
      }

      res.json({
        success: true,
        data: {
          suggestions: filteredRecipes,
          count: filteredRecipes.length,
          preferences: { dietary, cuisine, difficulty }
        },
        message: `Found ${filteredRecipes.length} recipe suggestions`
      });

    } catch (error) {
      logger.error('Error in getRecipeSuggestions:', error);
      next(error);
    }
  }

  /**
   * Get recipe nutrition analysis
   * GET /recipes/:id/nutrition
   */
  async getRecipeNutrition(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Valid recipe ID is required', 400)
        );
      }

      logger.info(`Fetching nutrition info for recipe ID: ${id}`);
      
      const recipe = await recipeService.getRecipeById(parseInt(id));
      
      // Extract and enhance nutritional information
      const nutritionData = {
        recipeId: recipe.id,
        recipeName: recipe.name,
        servings: recipe.servings,
        nutritionalInfo: recipe.nutritionalInfo,
        perServing: {
          calories: Math.round(parseInt(recipe.nutritionalInfo.calories) / recipe.servings),
          protein: recipe.nutritionalInfo.protein,
          carbs: recipe.nutritionalInfo.carbs,
          fat: recipe.nutritionalInfo.fat
        },
        healthScore: this.calculateHealthScore(recipe.nutritionalInfo, recipe.tags),
        dietaryTags: recipe.tags.filter(tag => 
          ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein'].includes(tag.toLowerCase())
        )
      };

      res.json({
        success: true,
        data: nutritionData,
        message: 'Nutrition information retrieved successfully'
      });

    } catch (error) {
      logger.error('Error in getRecipeNutrition:', error);
      next(error);
    }
  }

  /**
   * Calculate a simple health score based on nutritional info
   */
  calculateHealthScore(nutritionalInfo, tags) {
    let score = 50; // Base score
    
    // Adjust based on calories (optimal range 200-600 per serving)
    const calories = parseInt(nutritionalInfo.calories);
    if (calories >= 200 && calories <= 600) score += 20;
    else if (calories > 600) score -= 10;
    
    // Bonus for healthy tags
    const healthyTags = ['vegetarian', 'vegan', 'healthy', 'low-fat', 'high-protein'];
    const healthyTagCount = tags.filter(tag => 
      healthyTags.includes(tag.toLowerCase())
    ).length;
    score += healthyTagCount * 10;
    
    return Math.min(100, Math.max(0, score));
  }
}

module.exports = new RecipeController();