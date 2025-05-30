/**
 * Recipe Routes
 * Defines all recipe-related API endpoints
 */

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');

// GET /recipes - Get all recipes with optional filters
router.get('/', recipeController.getAllRecipes);

// GET /recipes/by-ingredients?items=eggs,tomato,cheese - Get recipes by ingredients
router.get('/by-ingredients', recipeController.getRecipesByIngredients);

// GET /recipes/search?q=omelet - Search recipes by name
router.get('/search', recipeController.searchRecipes);

// GET /recipes/:id - Get specific recipe by ID
router.get('/:id', recipeController.getRecipeById);

// GET /recipes/:id/instructions - Get step-by-step instructions for a recipe
router.get('/:name/instructions', recipeController.getRecipeInstructions);

module.exports = router;