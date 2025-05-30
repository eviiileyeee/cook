/**
 * Grocery List Routes
 * Defines all grocery list related API endpoints
 */

const express = require('express');
const router = express.Router();
const groceryController = require('../controllers/groceryController');

// GET /grocery-list?recipeId=123 - Generate grocery list for a recipe
router.get('/', groceryController.getGroceryList);

// POST /grocery-list/multiple - Generate combined grocery list for multiple recipes
router.post('/multiple', groceryController.getMultipleGroceryList);

// GET /grocery-list/:recipeId/by-category - Get categorized grocery list
router.get('/:recipeId/by-category', groceryController.getGroceryListByCategory);

// POST /grocery-list/check-availability - Check ingredient availability
router.post('/check-availability', groceryController.checkIngredientAvailability);

module.exports = router;