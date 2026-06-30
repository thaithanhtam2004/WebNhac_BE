const express = require("express");
const router = express.Router();
const GenreController = require("./genre.controller");

// 🟢 Lấy danh sách thể loại
router.get("/", GenreController.getAll);

// 🟢 Bulk actions (Phải nằm trước /:id)
router.post("/bulk-delete", GenreController.bulkDelete);
router.patch("/bulk-visibility", GenreController.bulkToggleVisibility);

// 🟢 Lấy thể loại theo ID
router.get("/:id", GenreController.getById);

// 🟢 Ẩn/Hiện thể loại
router.patch("/:id/visibility", GenreController.toggleVisibility);

// 🟢 Tạo thể loại mới
router.post("/", GenreController.create);

// 🟢 Cập nhật thể loại
router.put("/:id", GenreController.update);

// 🟢 Xóa thể loại
router.delete("/:id", GenreController.delete);

module.exports = router;
