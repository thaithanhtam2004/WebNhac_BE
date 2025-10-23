const express = require("express");
const router = express.Router();
const AlbumController = require("../controller/albumController");
// const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload"); // ⚙️ middleware multer
// Nếu bạn chưa có, tạo file middlewares/upload.js như Song.

// router.use(authMiddleware);

// 🟢 Lấy danh sách album
router.get("/", AlbumController.getAll);

// 🟢 Lấy album theo ID
router.get("/:id", AlbumController.getById);

// 🟢 Tạo album (có thể kèm ảnh)
router.post("/", upload.single("cover"), AlbumController.create);

// 🟢 Cập nhật album
router.put("/:id", upload.single("cover"), AlbumController.update);

// 🟢 Xóa album
router.delete("/:id", AlbumController.delete);

module.exports = router;
