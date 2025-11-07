const express = require("express");
const router = express.Router();
const PlaylistController = require("../controller/playlistController");

// 🟢 Lấy tất cả playlist
router.get("/", PlaylistController.getAll);

// 🟢 Lấy chi tiết 1 playlist (kèm danh sách bài hát)
router.get("/:id", PlaylistController.getById);

// 🟢 Lấy playlist theo user
router.get("/user/:userId", PlaylistController.getByUser);

// 🟢 Tạo playlist mới
router.post("/", PlaylistController.create);

// 🟢 Cập nhật playlist
router.put("/:id", PlaylistController.update);

// 🟢 Xóa playlist
router.delete("/:id", PlaylistController.delete);

// 🟢 Thêm bài hát vào playlist
router.post("/add-song", PlaylistController.addSong);

// 🟢 Xóa bài hát khỏi playlist
router.post("/remove-song", PlaylistController.removeSong);

module.exports = router;
