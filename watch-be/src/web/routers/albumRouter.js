const express = require("express");
const router = express.Router();
const AlbumController = require("../controller/albumController");
const upload = require("../middlewares/upload"); // ⚙️ multer upload

// 🟢 Lấy tất cả album
router.get("/", AlbumController.getAll);

// 🟢 Lấy album theo ID
router.get("/:id", AlbumController.getById);

// 🟢 Tạo album mới (có thể có ảnh bìa)
router.post("/", upload.single("cover"), AlbumController.create);

// 🟢 Cập nhật album
router.put("/:id", upload.single("cover"), AlbumController.update);

// 🟢 Xóa album
router.delete("/:id", AlbumController.delete);

module.exports = router;
