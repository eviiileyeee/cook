/**
 * Grocery Service
 * Handles business logic for grocery list generation
 */

const recipeService = require('./recipeService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errorHandler');

class GroceryService {
  constructor() {
    // Common ingredient categories for better organization
    this.ingredientCategories = {
      'produce': ['tomato', 'onion', 'garlic', 'basil', 'herbs', 'bell pepper', 'lettuce', 'cucumber'],
      'dairy': ['cheese', 'butter', 'milk', 'cream', 'yogurt', 'mozzarella', 'parmesan'],
      'protein': ['eggs', 'chicken', 'beef', 'fish', 'tofu'],
      'pantry': ['salt', 'pepper', 'olive oil', 'flour', 'sugar', 'pasta', 'rice'],
      'bread': ['bread', 'tortilla', 'buns', 'rolls'],
      'condiments': ['balsamic vinegar', 'soy sauce', 'hot sauce', 'mustard']
    };
  }

  /**
   * Generate grocery list for one or more recipes
   */
  async generateGroceryList(recipeIds, options = {}) {
    const { servings = null, excludeIngredients = [] } = options;

    if (!Array.isArray(recipeIds)) {
      recipeIds = [recipeIds];
    }

    logger.info(`Generating grocery list for recipes: ${recipeIds.join(', ')}`);

    const groceryList = {
      recipes: [],
      ingredients: {},
      categorizedIngredients: {},
      summary: {
        totalRecipes: recipeIds.length,
        totalIngredients: 0,
        estimatedCost: 0,
        estimatedTime: 0
      }
    };

    // Process each recipe
    for (const recipeId of recipeIds) {
      const recipe = await recipeService.getRecipeById(recipeId);
      
      groceryList.recipes.push({
        id: recipe.id,
        name: recipe.name,
        servings: servings || recipe.servings,
        cookingTime: recipe.cookingTime
      });

      // Add ingredients to the list
      for (const ingredient of recipe.ingredients) {
        if (excludeIngredients.includes(ingredient.toLowerCase())) {
          continue;
        }

        // Calculate quantity based on servings adjustment
        const servingMultiplier = servings ? servings / recipe.servings : 1;
        const quantity = this.calculateIngredientQuantity(ingredient, servingMultiplier);

        if (!groceryList.ingredients[ingredient]) {
          groceryList.ingredients[ingredient] = {
            name: ingredient,
            quantity: quantity.amount,
            unit: quantity.unit,
            category: this.categorizeIngredient(ingredient),
            recipes: [],
            notes: quantity.notes
          };
        }

        groceryList.ingredients[ingredient].recipes.push({
          recipeId: recipe.id,
          recipeName: recipe.name
        });
      }

      groceryList.summary.estimatedTime += recipe.cookingTime;
    }

    // Organize ingredients by category
    for (const [ingredientName, ingredientData] of Object.entries(groceryList.ingredients)) {
      const category = ingredientData.category;
      if (!groceryList.categorizedIngredients[category]) {
        groceryList.categorizedIngredients[category] = [];
      }
      groceryList.categorizedIngredients[category].push(ingredientData);
    }

    // Sort ingredients within each category
    for (const category of Object.keys(groceryList.categorizedIngredients)) {
      groceryList.categorizedIngredients[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    groceryList.summary.totalIngredients = Object.keys(groceryList.ingredients).length;
    groceryList.summary.estimatedCost = this.estimateTotalCost(groceryList.ingredients);

    return groceryList;
  }

  /**
   * Categorize ingredient into grocery store sections
   */
  categorizeIngredient(ingredient) {
    const lowerIngredient = ingredient.toLowerCase();
    
    for (const [category, ingredients] of Object.entries(this.ingredientCategories)) {
      if (ingredients.some(item => 
        lowerIngredient.includes(item) || item.includes(lowerIngredient)
      )) {
        return category;
      }
    }
    
    return 'other';
  }

  /**
   * Calculate ingredient quantities (simplified estimation)
   */
  calculateIngredientQuantity(ingredient, multiplier = 1) {
    const baseQuantities = {
      'eggs': { amount: 6, unit: 'pieces', notes: 'Large eggs' },
      'tomato': { amount: 2, unit: 'pieces', notes: 'Medium tomatoes' },
      'cheese': { amount: 200, unit: 'g', notes: 'Block or grated' },
      'butter': { amount: 100, unit: 'g', notes: 'Unsalted preferred' },
      'bread': { amount: 1, unit: 'loaf', notes: 'Whole grain or white' },
      'olive oil': { amount: 250, unit: 'ml', notes: 'Extra virgin' },
      'onion': { amount: 1, unit: 'piece', notes: 'Medium yellow onion' },
      'garlic': { amount: 1, unit: 'head', notes: 'Fresh bulb' },
      'pasta': { amount: 500, unit: 'g', notes: 'Dried pasta' },
      'salt': { amount: 1, unit: 'container', notes: 'Sea salt or table salt' },
      'pepper': { amount: 1, unit: 'container', notes: 'Freshly ground' }
    };

    const defaultQuantity = { amount: 1, unit: 'item', notes: 'Check recipe for specific amount' };
    const base = baseQuantities[ingredient.toLowerCase()] || defaultQuantity;
    
    return {
      amount: Math.ceil(base.amount * multiplier),
      unit: base.unit,
      notes: base.notes
    };
  }

  /**
   * Estimate total grocery cost (simplified)
   */
  estimateTotalCost(ingredients) {
    const averagePrices = {
      'eggs': 3.50,
      'tomato': 2.00,
      'cheese': 5.00,
      'butter': 4.00,
      'bread': 2.50,
      'olive oil': 6.00,
      'onion': 1.50,
      'garlic': 1.00,
      'pasta': 1.50,
      'salt': 1.00,
      'pepper': 3.00
    };

    let totalCost = 0;
    for (const ingredient of Object.keys(ingredients)) {
      totalCost += averagePrices[ingredient.toLowerCase()] || 2.50; // default price
    }

    return Math.round(totalCost * 100) / 100; // round to 2 decimal places
  }

  /**
   * Get shopping list in different formats
   */
  async getShoppingListFormats(recipeIds, options = {}) {
    const groceryList = await this.generateGroceryList(recipeIds, options);

    return {
      detailed: groceryList,
      simple: this.createSimpleList(groceryList),
      checklist: this.createChecklist(groceryList),
      categoryOrganized: groceryList.categorizedIngredients
    };
  }

  /**
   * Create a simple text list
   */
  createSimpleList(groceryList) {
    return Object.values(groceryList.ingredients).map(ingredient => 
      `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
    );
  }

  /**
   * Create a checklist format
   */
  createChecklist(groceryList) {
    return Object.entries(groceryList.categorizedIngredients).map(([category, ingredients]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      items: ingredients.map(ingredient => ({
        name: `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`,
        checked: false,
        notes: ingredient.notes
      }))
    }));
  }
}

module.exports = new GroceryService();