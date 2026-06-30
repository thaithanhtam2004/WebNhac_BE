const express = require("express");
const router = express.Router();
const UserRecommendationController = require("./recommendation.controller");

// ✅ Generate recommendation bằng Python script
router.post("/generate", UserRecommendationController.generate);

// ✅ Lấy recommendation kèm chi tiết bài hát
router.get("/:userId/details", UserRecommendationController.getWithSongDetail);

module.exports = router;
