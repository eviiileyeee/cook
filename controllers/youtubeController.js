const youtubeService = require('../services/youtubeService');
const { createErrorResponse } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class YouTubeController {
  async searchVideos(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Search query is required', 400)
        );
      }

      const maxResults = Math.min(parseInt(limit) || 10, 50);
      logger.info(`Searching YouTube videos for query: ${q}`);

      const videos = await youtubeService.searchVideos(q.trim(), maxResults);

      res.json({
        success: true,
        data: {
          query: q.trim(),
          count: videos.length,
          videos: videos
        },
        message: `Found ${videos.length} cooking videos for "${q}"`
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopularVideos(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const maxResults = Math.min(parseInt(limit) || 20, 50);

      logger.info('Fetching popular cooking videos');
      const videos = await youtubeService.getPopularCookingVideos(maxResults);

      res.json({
        success: true,
        data: {
          count: videos.length,
          videos: videos
        },
        message: 'Popular cooking videos retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async searchByRecipe(req, res, next) {
    try {
      const { recipeName } = req.params;
      const { limit = 5 } = req.query;

      if (!recipeName || recipeName.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Recipe name is required', 400)
        );
      }

      const maxResults = Math.min(parseInt(limit) || 5, 20);
      logger.info(`Searching YouTube videos for recipe: ${recipeName}`);

      const videos = await youtubeService.searchByRecipe(recipeName.trim(), maxResults);

      res.json({
        success: true,
        data: {
          recipe: recipeName.trim(),
          count: videos.length,
          videos: videos
        },
        message: `Found ${videos.length} videos for ${recipeName} recipe`
      });
    } catch (error) {
      next(error);
    }
  }

  async searchByIngredients(req, res, next) {
    try {
      const { items, limit = 8 } = req.query;

      if (!items || items.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Ingredients are required', 400)
        );
      }

      const ingredients = items.split(',').map(item => item.trim()).filter(item => item.length > 0);

      if (ingredients.length === 0) {
        return res.status(400).json(
          createErrorResponse('Valid ingredients are required', 400)
        );
      }

      const maxResults = Math.min(parseInt(limit) || 8, 30);
      const searchQuery = ingredients.join(' ');

      logger.info(`Searching YouTube videos for ingredients: ${ingredients.join(', ')}`);
      const videos = await youtubeService.searchVideos(searchQuery, maxResults);

      res.json({
        success: true,
        data: {
          ingredients: ingredients,
          count: videos.length,
          videos: videos
        },
        message: `Found ${videos.length} videos using ${ingredients.join(', ')}`
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendationsForRecipe(req, res, next) {
    try {
      const { recipeId } = req.params;
      const { limit = 3 } = req.query;

      if (!recipeId || isNaN(parseInt(recipeId))) {
        return res.status(400).json(
          createErrorResponse('Valid recipe ID is required', 400)
        );
      }

      const maxResults = Math.min(parseInt(limit) || 3, 10);
      logger.info(`Getting video recommendations for recipe ID: ${recipeId}`);

      const searchQuery = `recipe tutorial cooking`;
      const videos = await youtubeService.searchVideos(searchQuery, maxResults);

      res.json({
        success: true,
        data: {
          recipeId: parseInt(recipeId),
          count: videos.length,
          videos: videos
        },
        message: `Found ${videos.length} recommended videos for recipe`
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new YouTubeController();