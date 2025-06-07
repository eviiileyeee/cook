const { extractIngredientsFromImage } = require("../services/imageService");
const recipeService = require('../services/recipeService');
const fs = require("fs");
const logger = require("../utils/logger");


exports.detectIngredients = async (req, res) => {
  const imagePath = req.file?.path;

  try {
    if (!imagePath) {
      return res.status(400).json({ success: false, error: "No image uploaded" });
    }
    logger.info("Extracting ingredients from image:", imagePath);
    const resultText = await extractIngredientsFromImage(imagePath);

    const ingredients = resultText
      .split("\n")
      .map(item => item.replace(/^[-*•\d.]*\s*/, "").trim())
      .filter(Boolean);
    const recipes = await recipeService.findRecipesByIngredients(ingredients);
    logger.info("Recipes found:", recipes);
    res.status(200).json({ success: true, recipes });
  } catch (error) {
        logger.error("Gemini error:", error.message);
    res.status(500).json({ success: false, error: "Failed to process image." });
  } finally {
    // ✅ Always clean up the uploaded file
    if (imagePath) {
      fs.unlink(imagePath, err => {
        if (err) console.error("Failed to delete file:", imagePath, err);
        else console.log("✅ Deleted uploaded image:", imagePath);
      });
    }
  }
};

exports.healthCheck = async (req, res) => {
  res.send("<h1>Upload an image to detect ingredients</h1>");
};
