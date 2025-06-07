/**
 * Main Express application configuration
 * Sets up middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/errorMiddleware');
require('dotenv').config()

// Import route modules
const indexRoutes = require('./routes/index');
const recipeRoutes = require('./routes/recipes');
const groceryRoutes = require('./routes/groceryList');
const cookingTipsRoutes = require('./routes/cookingTips');
const youtubeRoutes = require('./routes/youtube');
const imageRoutes = require('./routes/image');
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.API_URL] 
    : ['http://localhost:8080'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// API Routes
app.use('/api', indexRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/grocery-list', groceryRoutes);
app.use('/api/cooking-tips', cookingTipsRoutes);
app.use('/api/youtube-videos', youtubeRoutes);
app.use('/api/image', imageRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Help Me Cooking API',
    version: '1.0.0',
    description: 'Backend API for recipe suggestions, cooking instructions, grocery lists, and cooking tips',
    endpoints: {
      'GET /api/recipes/by-ingredients': 'Get recipe suggestions based on available ingredients',
      'GET /api/recipes/:id/instructions': 'Get step-by-step cooking instructions for a recipe',
      'GET /api/grocery-list': 'Get grocery list for specific recipes',
      'GET /api/cooking-tips': 'Get general cooking tips and tricks',
      'GET /api/youtube-videos': 'Search for cooking-related YouTube videos'
    },
    examples: {
      'Recipe by ingredients': '/api/recipes/by-ingredients?items=eggs,tomato,cheese',
      'Recipe instructions': '/api/recipes/1/instructions',
      'Grocery list': '/api/grocery-list?recipeId=123',
      'YouTube search': '/api/youtube-videos?q=eggs+cheese+omelet'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware (must be last)
app.use(errorMiddleware);

module.exports = app;