const express = require("express");
const router = express.Router();

const upload = require("../utils/imageUpload");
const { detectIngredients, healthCheck } = require("../controllers/imageController");

router.post("/detect-ingredients", upload.single("image"), detectIngredients);
router.get("/", healthCheck);
module.exports = router;
