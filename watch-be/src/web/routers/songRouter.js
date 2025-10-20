const express = require("express");
const router = express.Router();
const SongController = require("../controller/songController");

// 🟢 Lấy danh sách bài hát
router.get("/", SongController.getAll);

// 🟢 Lấy bài hát theo ID
router.get("/:id", SongController.getById);

// 🟢 Tạo bài hát mới
router.post("/", SongController.create);

// 🟢 Cập nhật bài hát
router.put("/:id", SongController.update);

// 🟢 Xóa bài hát
router.delete("/:id", SongController.delete);

// 🟢 Cập nhật lượt nghe (views)
router.patch("/:id/views", SongController.updateViews);

module.exports = router;
