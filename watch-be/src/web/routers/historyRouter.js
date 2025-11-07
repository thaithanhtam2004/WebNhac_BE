const express = require("express");
const router = express.Router();
const HistoryController = require("../controller/historyController");

// 📌 Lấy lịch sử nghe của user
router.get("/:userId", HistoryController.getUserHistory);

// 📌 Lưu lịch sử (auto insert/update listenCount)
router.post("/", HistoryController.addHistory);

// 📌 Xóa toàn bộ lịch sử của user
router.delete("/:userId", HistoryController.clearHistory);

// 📌 Xóa 1 bài khỏi lịch sử
router.delete("/song", HistoryController.removeSong);

module.exports = router;
