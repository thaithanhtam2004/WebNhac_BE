const express = require("express");
const router = express.Router();
const multer = require("multer");
const AlbumController = require("./album.controller");

// Cấu hình multer
const upload = multer({ storage: multer.memoryStorage() });

// 🟢 Lấy danh sách album
router.get("/", AlbumController.getAll);

// 🟢 Bulk actions
router.post("/bulk-delete", AlbumController.bulkDelete);
router.patch("/bulk-visibility", AlbumController.bulkToggleVisibility);

// 🟢 Lấy album theo ID
router.get("/:id", AlbumController.getById);

// 🟢 Ẩn/Hiện album
router.patch("/:id/visibility", AlbumController.toggleVisibility);

// 🟢 Tạo album mới (với ảnh bìa)
router.post("/", upload.single("cover"), AlbumController.create);

// 🟢 Cập nhật album
router.put("/:id", upload.single("cover"), AlbumController.update);

// 🟢 Xóa album
router.delete("/:id", AlbumController.delete);

module.exports = router;
