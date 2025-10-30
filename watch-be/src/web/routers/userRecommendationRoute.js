// routes/userRecommendationRoutes.js
const express = require("express");
const router = express.Router();
const UserRecommendationController = require("../controller/UserRecommendationController");

// 🔹 POST /api/recommendations/generate
// // Tạo gợi ý cho tất cả user (chạy Python script)
// router.post("/generate", UserRecommendationController.generate);

// // 🔹 GET /api/recommendations/:userId
// // Lấy top recommendation cho user (chỉ songId + score)
// router.get("/:userId", UserRecommendationController.getWithSongDetail);

// 🔹 GET /api/recommendations/:userId/details
// Lấy top recommendation + thông tin bài hát (title, singer, genre)
router.get("/:userId/details", UserRecommendationController.getWithSongDetail);

module.exports = router;
