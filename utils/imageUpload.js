const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Storage engine config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = "uploads/";
  
      // 🔐 Ensure the uploads folder exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
  
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, "img-" + uniqueSuffix);
    },
  });

// File filter (optional): only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Final upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;
