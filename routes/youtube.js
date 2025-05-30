/**
 * YouTube Routes
 * Defines all YouTube video search related API endpoints
 */

const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtubeController');

// GET /youtube-videos?q=eggs+cheese+omelet - Search YouTube cooking videos
router.get('/', youtubeController.searchVideos);

// GET /youtube-videos/popular - Get popular cooking videos
router.get('/popular', youtubeController.getPopularVideos);

// GET /youtube-videos/ingredients?items=eggs,cheese - Search videos by ingredients
router.get('/ingredients', youtubeController.searchByIngredients);

// GET /youtube-videos/recipe/:recipeName - Search videos by recipe name
router.get('/recipe/:recipeName', youtubeController.searchByRecipe);

// GET /youtube-videos/recommendations/:recipeId - Get video recommendations for recipe
router.get('/recommendations/:recipeId', youtubeController.getRecommendationsForRecipe);

module.exports = router;