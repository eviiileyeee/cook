/**
 * Cooking Tips Routes
 * Defines all cooking tips related API endpoints
 */

const express = require('express');
const router = express.Router();
const cookingTipsController = require('../controllers/cookingTipsController');

// GET /cooking-tips - Get all cooking tips
router.get('/', cookingTipsController.getAllTips);

// GET /cooking-tips/categories - Get all tip categories
router.get('/categories', cookingTipsController.getCategories);

// GET /cooking-tips/random - Get random cooking tip
router.get('/random', cookingTipsController.getRandomTip);

// GET /cooking-tips/daily - Get daily cooking tip
router.get('/daily', cookingTipsController.getDailyTip);

// GET /cooking-tips/search?q=knife - Search cooking tips
router.get('/search', cookingTipsController.searchTips);

// GET /cooking-tips/category/:category - Get tips by category
router.get('/category/:category', cookingTipsController.getTipsByCategory);

// GET /cooking-tips/:id - Get specific tip by ID
router.get('/:id', cookingTipsController.getTipById);

module.exports = router;