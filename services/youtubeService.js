const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    if (!this.apiKey) {
      logger.error('YouTube API key not found in environment variables');
    }
    if (!process.env.GEMINI_API_KEY) {
      logger.error('Gemini API key not found in environment variables');
    }
  }

  async generateSearchQuery(input, context) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate a YouTube search query for cooking videos based on the following input: "${input}". 
                     Context: ${context}. 
                     Format: Return only the search query without any explanations.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      logger.error('Error generating search query with Gemini:', error);
      return input; // Fallback to original input if AI generation fails
    }
  }

  async searchVideos(query, maxResults = 10) {
    try {
      if (!this.apiKey) {
        throw new AppError('YouTube API key not configured', 500);
      }

      // Generate optimized search query using Gemini
      const enhancedQuery = await this.generateSearchQuery(query, 'cooking recipe tutorial');
      
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          q: enhancedQuery,
          part: 'snippet',
          type: 'video',
          maxResults: Math.min(maxResults, 50),
          order: 'relevance',
          videoCategoryId: '26',
          safeSearch: 'strict'
        },
        timeout: 10000
      });

      if (!response.data || !response.data.items) {
        logger.warn('No videos found for query:', enhancedQuery);
        return [];
      }

      const videos = response.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: {
          default: item.snippet.thumbnails.default?.url,
          medium: item.snippet.thumbnails.medium?.url,
          high: item.snippet.thumbnails.high?.url
        },
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        enhancedQuery // Include the AI-enhanced query for transparency
      }));

      logger.info(`Found ${videos.length} videos for query: ${enhancedQuery}`);
      return videos;

    } catch (error) {
      this.handleSearchError(error);
    }
  }

  async getPopularCookingVideos(maxResults = 20) {
    try {
      const aiQuery = await this.generateSearchQuery('popular cooking recipes', 'trending and highly rated');
      return await this.searchVideos(aiQuery, maxResults);
    } catch (error) {
      logger.error('Error fetching popular cooking videos:', error.message);
      throw error;
    }
  }

  async searchByRecipe(recipeName, maxResults = 5) {
    try {
      const aiQuery = await this.generateSearchQuery(recipeName, 'detailed cooking instructions and recipe tutorial');
      return await this.searchVideos(aiQuery, maxResults);
    } catch (error) {
      logger.error(`Error searching videos for recipe ${recipeName}:`, error.message);
      throw error;
    }
  }

  handleSearchError(error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.response) {
      const { status, data } = error.response;
      if (status === 403) {
        throw new AppError('YouTube API quota exceeded or invalid API key', 503);
      } else if (status === 400) {
        throw new AppError('Invalid search parameters', 400);
      } else {
        throw new AppError(`YouTube API error: ${data.error?.message || 'Unknown error'}`, status);
      }
    }

    if (error.code === 'ECONNABORTED') {
      throw new AppError('YouTube API request timeout', 408);
    }

    logger.error('YouTube service error:', error.message);
    throw new AppError('Failed to search YouTube videos', 500);
  }
}
module.exports = new YouTubeService();