const express = require("express");
const router = express.Router();
const AlbumController = require("../controller/albumController");
const authMiddleware = require("../middlewares/authMiddleware");

//router.use(authMiddleware);

// 🟢 Lấy danh sách album
router.get("/", AlbumController.getAll);

// 🟢 Lấy album theo ID
router.get("/:id", AlbumController.getById);

// 🟢 Tạo album mới
router.post("/", AlbumController.create);

// 🟢 Cập nhật album
router.put("/:id", AlbumController.update);

// 🟢 Xóa album
router.delete("/:id", AlbumController.delete);

module.exports = router;
