/**
 * Cooking Tips Controller
 * Handles HTTP requests for cooking tips and advice
 */

const cookingTipsService = require('../services/cookingTipsService');
const { createErrorResponse } = require('../utils/errorHandler');
const logger = require('../utils/logger');

class CookingTipsController {
  /**
   * Get all cooking tips
   * GET /cooking-tips
   */
  async getAllTips(req, res, next) {
    try {
      const { category, limit = 50 } = req.query;
      
      logger.info('Fetching cooking tips', category ? `for category: ${category}` : '');
      
      const tips = await cookingTipsService.getAllTips({
        category,
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: {
          count: tips.length,
          tips: tips
        },
        message: 'Cooking tips retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tips by category
   * GET /cooking-tips/category/:category
   */
  async getTipsByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const { limit = 20 } = req.query;

      if (!category) {
        return res.status(400).json(
          createErrorResponse('Category is required', 400)
        );
      }

      logger.info(`Fetching cooking tips for category: ${category}`);
      
      const tips = await cookingTipsService.getTipsByCategory(category, parseInt(limit));

      res.json({
        success: true,
        data: {
          category: category,
          count: tips.length,
          tips: tips
        },
        message: `Tips for ${category} retrieved successfully`
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get random cooking tip
   * GET /cooking-tips/random
   */
  async getRandomTip(req, res, next) {
    try {
      const { category } = req.query;
      
      logger.info('Fetching random cooking tip', category ? `from category: ${category}` : '');
      
      const tip = await cookingTipsService.getRandomTip(category);

      res.json({
        success: true,
        data: tip,
        message: 'Random cooking tip retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Search cooking tips
   * GET /cooking-tips/search?q=knife
   */
  async searchTips(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || q.trim().length === 0) {
        return res.status(400).json(
          createErrorResponse('Search query is required', 400)
        );
      }

      logger.info(`Searching cooking tips for query: ${q}`);
      
      const tips = await cookingTipsService.searchTips(q.trim(), parseInt(limit));

      res.json({
        success: true,
        data: {
          query: q.trim(),
          count: tips.length,
          tips: tips
        },
        message: `Found ${tips.length} tips matching "${q}"`
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tip categories
   * GET /cooking-tips/categories
   */
  async getCategories(req, res, next) {
    try {
      logger.info('Fetching cooking tip categories');
      
      const categories = await cookingTipsService.getCategories();

      res.json({
        success: true,
        data: {
          count: categories.length,
          categories: categories
        },
        message: 'Cooking tip categories retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tip by ID
   * GET /cooking-tips/:id
   */
  async getTipById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json(
          createErrorResponse('Valid tip ID is required', 400)
        );
      }

      logger.info(`Fetching cooking tip with ID: ${id}`);
      
      const tip = await cookingTipsService.getTipById(parseInt(id));

      res.json({
        success: true,
        data: tip,
        message: 'Cooking tip retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily tip
   * GET /cooking-tips/daily
   */
  async getDailyTip(req, res, next) {
    try {
      logger.info('Fetching daily cooking tip');
      
      const tip = await cookingTipsService.getDailyTip();

      res.json({
        success: true,
        data: tip,
        message: 'Daily cooking tip retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CookingTipsController();