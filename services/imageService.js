require("dotenv").config();
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../utils/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function imageToBase64(filePath) {
  const file = fs.readFileSync(filePath);
  return file.toString("base64");
}

async function extractIngredientsFromImage(imagePath) {
  const model = genAI.getGenerativeModel({
    model: "models/gemini-1.5-flash-latest",
  });
  logger.info("Extracting ingredients from image:", imagePath);
  const base64Image = imageToBase64(imagePath);

  const prompt = `List all recognizable food ingredients shown in this image as a clean list. Only include edible items like vegetables, spices, fruits, etc.`;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
  ]);

  const response = await result.response;
  return response.text();
}

module.exports = { extractIngredientsFromImage };
