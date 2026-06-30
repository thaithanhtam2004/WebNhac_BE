const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // ← CLOUD_NAME
  api_key: process.env.CLOUDINARY_API_KEY,        // ← API_KEY
  api_secret: process.env.CLOUDINARY_API_SECRET,  // ← API_SECRET
});

// Log để kiểm tra
console.log("☁️ Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Có" : "Không có",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Có" : "Không có"
});

module.exports = cloudinary;