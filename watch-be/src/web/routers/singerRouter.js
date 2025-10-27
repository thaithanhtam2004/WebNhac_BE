const express = require("express");
const router = express.Router();
const multer = require("multer");
const SingerController = require("../controller/singerController");

// Cấu hình multer để lưu vào memory
const upload = multer({ storage: multer.memoryStorage() });

// 🟢 Lấy danh sách ca sĩ
router.get("/", SingerController.getAll);

// 🟢 Lấy ca sĩ theo ID
router.get("/:id", SingerController.getById);

// 🟢 Tạo ca sĩ mới (với upload ảnh)
router.post("/", upload.single("image"), SingerController.create);

// 🟢 Cập nhật ca sĩ (với upload ảnh)
router.put("/:id", upload.single("image"), SingerController.update);

// 🟢 Xóa ca sĩ
router.delete("/:id", SingerController.delete);

module.exports = router;