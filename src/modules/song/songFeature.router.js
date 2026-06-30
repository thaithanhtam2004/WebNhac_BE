const express = require("express");
const router = express.Router();
const SongFeatureController = require("./songFeature.controller");
const upload = require("../../middlewares/upload");

// 🧠 1️⃣ Trích xuất đặc trưng âm thanh (feature.py)
router.post(
  "/analyze",
  upload.single("file"), // middleware xử lý file upload từ client
  SongFeatureController.analyze
);

// 🎭 2️⃣ Dự đoán cảm xúc bài hát (emotion_predictor.py)
router.post(
  "/predict-emotion",
  upload.single("file"),
  SongFeatureController.predictEmotion
);

// 🎵 3️⃣ Lấy đặc trưng bài hát theo songId
router.get("/:songId", SongFeatureController.getBySongId);


module.exports = router;
