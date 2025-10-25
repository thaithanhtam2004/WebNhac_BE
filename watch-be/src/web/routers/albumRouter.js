const express = require("express");
const router = express.Router();
const AlbumController = require("../controller/albumController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware"); // Nếu có middleware upload

// 🟢 Lấy danh sách album
router.get("/", AlbumController.getAll);

// 🟢 Lấy album theo ID (theo commit "album user")
router.get("/:albumId", AlbumController.getAlbumById);

// 🟢 Tạo album (có thể kèm ảnh)
router.post("/", upload.single("cover"), AlbumController.create);

// 🟢 Cập nhật album
router.put("/:id", upload.single("cover"), AlbumController.update);

// 🟢 Xóa album
router.delete("/:id", AlbumController.delete);

module.exports = router;
