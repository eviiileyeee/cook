/**
 * Cooking Tips Service
 * Handles business logic for cooking tips and advice
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');

class CookingTipsService {
  constructor() {
    this.tipsPath = path.join(__dirname, '../data/cookingTips.json');
    this.tipsData = null;
  }

  /**
   * Load cooking tips data from JSON file
   */
  async loadTipsData() {
    try {
      if (!this.tipsData) {
        const data = await fs.readFile(this.tipsPath, 'utf8');
        this.tipsData = JSON.parse(data);
        logger.info('Cooking tips data loaded successfully');
      }
      return this.tipsData;
    } catch (error) {
      logger.error('Error loading cooking tips data:', error);
      throw new AppError('Failed to load cooking tips data', 500);
    }
  }

  /**
   * Get all cooking tips with optional filtering
   */
  async getAllTips(filters = {}) {
    const data = await this.loadTipsData();
    let tips = [...data.cookingTips];

    // Apply filters
    if (filters.category) {
      tips = tips.filter(tip => 
        tip.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.difficulty) {
      tips = tips.filter(tip => 
        tip.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    if (filters.importance) {
      tips = tips.filter(tip => 
        tip.importance.toLowerCase() === filters.importance.toLowerCase()
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'importance':
          const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          tips.sort((a, b) => importanceOrder[b.importance] - importanceOrder[a.importance]);
          break;
        case 'difficulty':
          const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
          tips.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
          break;
        case 'category':
          tips.sort((a, b) => a.category.localeCompare(b.category));
          break;
        default:
          // Default sort by importance, then by difficulty
          tips.sort((a, b) => {
            const importanceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
            const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
            
            if (importanceOrder[b.importance] !== importanceOrder[a.importance]) {
              return importanceOrder[b.importance] - importanceOrder[a.importance];
            }
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          });
      }
    }

    // Apply pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTips = tips.slice(startIndex, endIndex);

    return {
      tips: paginatedTips,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(tips.length / limit),
        totalTips: tips.length,
        hasNext: endIndex < tips.length,
        hasPrev: page > 1
      },
      categories: data.categories,
      filters: {
        applied: filters,
        available: {
          categories: [...new Set(data.cookingTips.map(tip => tip.category))],
          difficulties: [...new Set(data.cookingTips.map(tip => tip.difficulty))],
          importance: [...new Set(data.cookingTips.map(tip => tip.importance))]
        }
      }
    };
  }

  /**
   * Get tips by category
   */
  async getTipsByCategory(category) {
    const data = await this.loadTipsData();
    const tips = data.cookingTips.filter(tip => 
      tip.category.toLowerCase() === category.toLowerCase()
    );

    if (tips.length === 0) {
      throw new AppError(`No tips found for category: ${category}`, 404);
    }

    const categoryInfo = data.categories.find(cat => 
      cat.name.toLowerCase() === category.toLowerCase()
    );

    return {
      category: categoryInfo || { name: category, description: '' },
      tips,
      totalTips: tips.length
    };
  }

  /**
   * Get random cooking tips
   */
  async getRandomTip(count = 5, difficulty = null) {
    const data = await this.loadTipsData();
    let tips = [...data.cookingTips];

    // Filter by difficulty if specified
    if (difficulty) {
      tips = tips.filter(tip => 
        tip.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Shuffle array and get random tips
    const shuffled = tips.sort(() => 0.5 - Math.random());
    const randomTips = shuffled.slice(0, Math.min(count, shuffled.length));

    return {
      tips: randomTips,
      totalAvailable: tips.length,
      requested: count,
      returned: randomTips.length,
      difficulty: difficulty || 'all'
    };
  }

  /**
   * Get tip by ID
   */
  async getTipById(tipId) {
    const data = await this.loadTipsData();
    const tip = data.cookingTips.find(t => t.id === parseInt(tipId));

    if (!tip) {
      throw new AppError(`Tip with ID ${tipId} not found`, 404);
    }

    // Get related tips from the same category
    const relatedTips = data.cookingTips
      .filter(t => t.category === tip.category && t.id !== tip.id)
      .slice(0, 3);

    return {
      tip,
      relatedTips,
      category: data.categories.find(cat => cat.name === tip.category)
    };
  }

  /**
   * Get daily cooking tip
   */
  async getDailyTip() {
    const data = await this.loadTipsData();
    
    // Use current date to deterministically select a tip
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = dayOfYear % data.cookingTips.length;
    
    const dailyTip = data.cookingTips[tipIndex];

    return {
      tip: dailyTip,
      date: today.toISOString().split('T')[0],
      message: "Today's cooking tip",
      category: data.categories.find(cat => cat.name === dailyTip.category)
    };
  }

  /**
   * Search tips by keyword
   */
  async searchTips(query, options = {}) {
    const data = await this.loadTipsData();
    const searchQuery = query.toLowerCase();
    
    const matchingTips = data.cookingTips.filter(tip => 
      tip.title.toLowerCase().includes(searchQuery) ||
      tip.tip.toLowerCase().includes(searchQuery) ||
      tip.category.toLowerCase().includes(searchQuery)
    );

    // Sort by relevance (title matches first, then content matches)
    matchingTips.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(searchQuery);
      const bTitle = b.title.toLowerCase().includes(searchQuery);
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      return 0;
    });

    const limit = parseInt(options.limit) || 10;
    const limitedResults = matchingTips.slice(0, limit);

    return {
      query,
      results: limitedResults,
      totalFound: matchingTips.length,
      returned: limitedResults.length
    };
  }
}

module.exports = new CookingTipsService();