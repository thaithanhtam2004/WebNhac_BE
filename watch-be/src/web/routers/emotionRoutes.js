const express = require("express");
const router = express.Router();
const EmotionController = require("../controller/emotionController");

// 🟢 Lấy tất cả cảm xúc
router.get("/", EmotionController.getAll);

// 🟢 Lấy chi tiết 1 cảm xúc
router.get("/:id", EmotionController.getById);

// 🟢 Tạo cảm xúc mới
router.post("/", EmotionController.create);

// 🟢 Cập nhật cảm xúc
router.put("/:id", EmotionController.update);

// 🟢 Xóa cảm xúc
router.delete("/:id", EmotionController.delete);

module.exports = router;
