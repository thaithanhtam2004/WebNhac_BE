// src/web/routers/historyRouter.js
const express = require("express");
const router = express.Router();
const HistoryController = require("../controller/historyController");

router.get("/:userId", HistoryController.getUserHistory);        // Lấy lịch sử
router.post("/", HistoryController.addHistory);                   // Thêm bài
router.put("/:id", HistoryController.updateHistory);             // Update time
router.delete("/:userId", HistoryController.clearHistory);       // Xóa toàn bộ
router.delete("/song", HistoryController.removeSong);            // Xóa 1 bài cụ thể

module.exports = router;
