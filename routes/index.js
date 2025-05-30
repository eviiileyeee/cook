/**
 * Main Routes Index
 * Centralized route management for the Help Me Cooking API
 */

const express = require('express');
const router = express.Router();

// Import route modules
const recipeRoutes = require('./recipes');
const groceryRoutes = require('./groceryList');
const cookingTipsRoutes = require('./cookingTips');
const youtubeRoutes = require('./youtube');

// API information endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Help Me Cooking API',
      version: '1.0.0',
      description: 'Backend API for recipe suggestions, cooking tips, and grocery lists',
      endpoints: {
        recipes: '/api/recipes',
        groceryList: '/api/grocery-list',
        cookingTips: '/api/cooking-tips',
        youtube: '/api/youtube-videos'
      },
      documentation: {
        recipes: {
          'GET /api/recipes': 'Get all recipes with optional filters',
          'GET /api/recipes/by-ingredients?items=eggs,cheese': 'Find recipes by ingredients',
          'GET /api/recipes/:id': 'Get specific recipe by ID',
          'GET /api/recipes/:id/instructions': 'Get step-by-step instructions',
          'GET /api/recipes/search?q=omelet': 'Search recipes by name'
        },
        groceryList: {
          'GET /api/grocery-list?recipeId=123': 'Generate grocery list for recipe',
          'POST /api/grocery-list/multiple': 'Generate combined grocery list for multiple recipes',
          'GET /api/grocery-list/:recipeId/by-category': 'Get categorized grocery list'
        },
        cookingTips: {
          'GET /api/cooking-tips': 'Get all cooking tips',
          'GET /api/cooking-tips/category/:category': 'Get tips by category',
          'GET /api/cooking-tips/random': 'Get random cooking tip',
          'GET /api/cooking-tips/search?q=knife': 'Search cooking tips'
        },
        youtube: {
          'GET /api/youtube-videos?q=omelet': 'Search cooking videos',
          'GET /api/youtube-videos/popular': 'Get popular cooking videos',
          'GET /api/youtube-videos/recipe/:recipeName': 'Get videos for specific recipe'
        }
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    },
    message: 'API is healthy and running'
  });
});

// Mount route modules
router.use('/recipes', recipeRoutes);
router.use('/grocery-list', groceryRoutes);
router.use('/cooking-tips', cookingTipsRoutes);
router.use('/youtube-videos', youtubeRoutes);

module.exports = router;