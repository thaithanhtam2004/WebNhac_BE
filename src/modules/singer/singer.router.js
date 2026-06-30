const express = require("express");
const router = express.Router();
const multer = require("multer");
const SingerController = require("./singer.controller");

// Cấu hình multer để lưu vào memory
const upload = multer({ storage: multer.memoryStorage() });

// 🟢 Lấy danh sách ca sĩ
router.get("/", SingerController.getAll);

// 🟢 Bulk actions (Must be before /:id)
router.post("/bulk-delete", SingerController.bulkDelete);
router.patch("/bulk-visibility", SingerController.bulkToggleVisibility);

// 🟢 Lấy ca sĩ theo ID
router.get("/:id", SingerController.getById);

// 🟢 Ẩn/Hiện ca sĩ
router.patch("/:id/visibility", SingerController.toggleVisibility);

// 🟢 Tạo ca sĩ mới (với upload ảnh)
router.post("/", upload.single("image"), SingerController.create);

// 🟢 Cập nhật ca sĩ (với upload ảnh)
router.put("/:id", upload.single("image"), SingerController.update);

// 🟢 Xóa ca sĩ
router.delete("/:id", SingerController.delete);

module.exports = router;
