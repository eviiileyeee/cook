/**
 * Recipe Service with Gemini AI Integration
 * Handles business logic for recipe operations using Gemini Flash 1.5
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');
require('dotenv').config();


class RecipeService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Find recipes that can be made with available ingredients using Gemini AI
   */
  async findRecipesByIngredients(availableIngredients, limit = 10) {
    try {
      const prompt = `
        Given these available ingredients: ${availableIngredients.join(', ')}
        
        Please provide ${limit} recipes that can be made using some or all of these ingredients. 
        For each recipe, provide a detailed JSON response with the following structure:

        {
          "searchedIngredients": ["${availableIngredients.join('", "')}"],
          "totalFound": ${limit},
          "recipes": [
            {
              "id": 1,
              "name": "Recipe Name",
              "description": "Brief description of the recipe",
              "cookingTime": 30,
              "servings": 4,
              "difficulty": "easy|medium|hard",
              "cuisine": "Italian",
              "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
              "nutritionalInfo": {
                "calories": 320,
                "protein": "22g",
                "carbs": "15g",
                "fat": "18g"
              },
              "tags": ["breakfast", "quick", "vegetarian"],
              "rating": 4.5,
              "image": "https://example.com/recipe-image.jpg",
              "matchScore": 3,
              "matchPercentage": 75,
              "matchedIngredients": ["ingredient1", "ingredient2"],
              "missingIngredients": ["ingredient3"],
              "canMake": true
            }
          ]
        }

        Requirements:
        1. Calculate matchScore based on how many of the available ingredients are used
        2. Calculate matchPercentage as (matchScore / total ingredients) * 100
        3. List matchedIngredients that match the available ingredients
        4. List missingIngredients that are needed but not available
        5. Set canMake to true if at least 1 ingredient matches
        6. Provide realistic cooking times, nutritional info, and ratings
        7. Include diverse cuisines and difficulty levels
        8. Make sure ingredient matching is accurate
        9. Sort recipes by matchScore (highest first)
        10. Only return valid, cookable recipes

        Return ONLY the JSON response, no additional text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response and parse JSON
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const recipesData = JSON.parse(cleanedText);

      // Validate and enhance the response
      const enhancedRecipes = recipesData.recipes.map((recipe, index) => ({
        ...recipe,
        id: index + 1,
        image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipe.name)}`,
        // Recalculate match data to ensure accuracy
        ...this.calculateMatchData(recipe, availableIngredients)
      }));

      return {
        searchedIngredients: availableIngredients,
        totalFound: enhancedRecipes.length,
        recipes: enhancedRecipes.sort((a, b) => b.matchScore - a.matchScore)
      };

    } catch (error) {
      logger.error('Error generating recipes with Gemini AI:', error);

      // Fallback to a basic response if AI fails
      return this.getFallbackRecipes(availableIngredients, limit);
    }
  }

  /**
   * Calculate accurate match data for a recipe
   */
  calculateMatchData(recipe, availableIngredients) {
    const recipeIngredients = recipe.ingredients || [];
    const matchedIngredients = recipeIngredients.filter(ingredient =>
      availableIngredients.some(available =>
        available.toLowerCase().includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(available.toLowerCase()) ||
        this.isIngredientMatch(available, ingredient)
      )
    );

    const matchScore = matchedIngredients.length;
    const matchPercentage = Math.round((matchScore / recipeIngredients.length) * 100);
    const missingIngredients = recipeIngredients.filter(ingredient =>
      !matchedIngredients.includes(ingredient)
    );

    return {
      matchScore,
      matchPercentage,
      matchedIngredients,
      missingIngredients,
      canMake: matchScore >= 1
    };
  }

  /**
   * Enhanced ingredient matching logic
   */
  isIngredientMatch(available, required) {
    const availableLower = available.toLowerCase();
    const requiredLower = required.toLowerCase();

    // Direct match
    if (availableLower === requiredLower) return true;

    // Partial matches
    const synonyms = {
      'tomato': ['tomatoes', 'tomato'],
      'egg': ['eggs', 'egg'],
      'cheese': ['cheddar', 'mozzarella', 'parmesan', 'cheese'],
      'onion': ['onions', 'onion'],
      'garlic': ['garlic clove', 'garlic cloves'],
      'pepper': ['bell pepper', 'peppers'],
      'oil': ['olive oil', 'cooking oil', 'vegetable oil']
    };

    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(availableLower) && values.includes(requiredLower)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get detailed cooking instructions for a specific recipe using Gemini AI
   */
  async getRecipeInstructions(recipeData) {
    try {
      // First, we need to get the recipe details (this would typically come from the previous search)
      // For now, we'll ask Gemini to provide instructions for a recipe by ID
      const prompt = `
        You are an expert cooking assistant AI that provides step-by-step instructions for a recipe in a structured JSON format designed for a mobile or web app.

The app shows ONE instruction at a time on a CARD with voice narration, summary, and timer support. Your response should be JSON only. Follow the exact schema below.
and return data in hindi

For the recipe named: "${recipeData}", return:

{
  "title": "Full Recipe Name",
  "description": "Brief overview of the recipe",
  "servings": 4,
  "difficulty": "easy | medium | hard",
  "cuisine": "e.g., Italian",
  "tags": ["tag1", "tag2"],
  "rating": 4.5,
  "ingredients": ["ingredient1", "ingredient2", ...],
  "nutritionalInfo": {
    "calories": 320,
    "protein": "22g",
    "carbs": "15g",
    "fat": "18g"
  },
  "instructions": {
    "totalSteps": N,
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 20,
    "steps": [
      {
        "step": 1,
        "instruction": "Full instruction text for this step",
        "summary": "Short version of the step",
        "ingredients": ["Ingredient1", "Ingredient2 used in this step"],
        "durationSeconds": 300,
        "showTimer": true,
        "voiceInstruction": "Same as instruction, or rephrased for natural speaking",
        "safetyTips": ["e.g., Be careful with hot oil"],
        "image": "URL or null"
      },
      ...
    ]
  }
}

🔒 Rules:
- DO NOT add explanations or extra text outside the JSON.
- If you don't know a value (e.g., image), return null.
- Estimate durations based on normal cooking behavior.
- Use clear and simple language.

Return only clean JSON. No markdown, no comments.

      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      logger.error('Error generating recipe instructions with Gemini AI:', error);
      throw new AppError(`Failed to get instructions for recipe ${recipeId}`, 500);
    }
  }

  /**
   * Get recipe by ID using Gemini AI
   */
  async getRecipeById(recipeId) {
    try {
      const prompt = `
        Please provide a detailed recipe for recipe ID ${recipeId}. 
        If you don't have the specific recipe, provide a popular recipe.
        
        Return the response in this exact JSON format:
        {
          "id": ${recipeId},
          "name": "Recipe Name",
          "description": "Detailed description of the recipe",
          "cookingTime": 30,
          "servings": 4,
          "difficulty": "easy",
          "cuisine": "Italian",
          "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
          "nutritionalInfo": {
            "calories": 320,
            "protein": "22g",
            "carbs": "15g",
            "fat": "18g"
          },
          "tags": ["tag1", "tag2", "tag3"],
          "rating": 4.5,
          "image": "https://via.placeholder.com/300x200?text=Recipe"
        }

        Return ONLY the JSON response.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);

    } catch (error) {
      logger.error('Error getting recipe by ID with Gemini AI:', error);
      throw new AppError(`Recipe with ID ${recipeId} not found`, 404);
    }
  }

  /**
   * Get all recipes with optional filtering using Gemini AI
   */
  async getAllRecipes(filters = {}) {
    try {
      const { limit = 20, cuisine, difficulty } = filters;

      let filterText = '';
      if (cuisine) filterText += `Cuisine: ${cuisine}. `;
      if (difficulty) filterText += `Difficulty: ${difficulty}. `;

      const prompt = `
        Please provide ${limit} diverse recipes${filterText ? ` with these filters: ${filterText}` : ''}.
        
        Return the response in this exact JSON format:
        {
          "count": ${limit},
          "recipes": [
            {
              "id": 1,
              "name": "Recipe Name",
              "description": "Brief description",
              "cookingTime": 30,
              "servings": 4,
              "difficulty": "easy",
              "cuisine": "Italian",
              "ingredients": ["ingredient1", "ingredient2"],
              "nutritionalInfo": {
                "calories": 320,
                "protein": "22g",
                "carbs": "15g",
                "fat": "18g"
              },
              "tags": ["tag1", "tag2"],
              "rating": 4.5,
              "image": "https://via.placeholder.com/300x200?text=Recipe"
            }
          ]
        }

        Requirements:
        1. Provide diverse recipes from different cuisines
        2. Include realistic cooking times and nutritional information
        3. Use appropriate difficulty levels
        4. Include relevant tags
        5. Provide realistic ratings between 3.5-5.0

        Return ONLY the JSON response.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanedText);

      return data.recipes.map((recipe, index) => ({
        ...recipe,
        id: index + 1,
        image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipe.name)}`
      }));

    } catch (error) {
      logger.error('Error getting all recipes with Gemini AI:', error);
      throw new AppError('Failed to retrieve recipes', 500);
    }
  }

  /**
   * Search recipes by name using Gemini AI
   */
  async searchRecipesByName(query, limit = 10) {
    try {
      const prompt = `
        Find ${limit} recipes that match or are similar to the search query: "${query}"
        
        Return the response in this exact JSON format:
        {
          "query": "${query}",
          "count": ${limit},
          "recipes": [
            {
              "id": 1,
              "name": "Recipe Name",
              "description": "Brief description",
              "cookingTime": 30,
              "servings": 4,
              "difficulty": "easy",
              "cuisine": "Italian",
              "ingredients": ["ingredient1", "ingredient2"],
              "nutritionalInfo": {
                "calories": 320,
                "protein": "22g",
                "carbs": "15g",
                "fat": "18g"
              },
              "tags": ["tag1", "tag2"],
              "rating": 4.5,
              "image": "https://via.placeholder.com/300x200?text=Recipe"
            }
          ]
        }

        Requirements:
        1. Find recipes that closely match the search query
        2. Include variations and similar recipes
        3. Sort by relevance to the search query
        4. Provide complete recipe information

        Return ONLY the JSON response.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanedText);

      return data.recipes.map((recipe, index) => ({
        ...recipe,
        id: index + 1,
        image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(recipe.name)}`
      }));

    } catch (error) {
      logger.error('Error searching recipes with Gemini AI:', error);
      throw new AppError('Failed to search recipes', 500);
    }
  }

  /**
   * Fallback recipes when AI fails
   */
  getFallbackRecipes(availableIngredients, limit) {
    const fallbackRecipes = [
      {
        id: 1,
        name: "Simple Scrambled Eggs",
        description: "Basic scrambled eggs with available ingredients",
        cookingTime: 10,
        servings: 2,
        difficulty: "easy",
        cuisine: "American",
        ingredients: ["eggs", "salt", "pepper", "butter"],
        nutritionalInfo: { calories: 200, protein: "14g", carbs: "2g", fat: "15g" },
        tags: ["breakfast", "quick", "easy"],
        rating: 4.0,
        image: "https://via.placeholder.com/300x200?text=Scrambled+Eggs"
      }
    ];

    const recipes = fallbackRecipes.slice(0, limit).map(recipe => ({
      ...recipe,
      ...this.calculateMatchData(recipe, availableIngredients)
    }));

    return {
      searchedIngredients: availableIngredients,
      totalFound: recipes.length,
      recipes: recipes
    };
  }
}

module.exports = new RecipeService();