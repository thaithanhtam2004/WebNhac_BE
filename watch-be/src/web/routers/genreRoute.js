const express = require("express");
const router = express.Router();
const GenreController = require("../controller/genreController"); // ⚠️ đường dẫn đúng với folder bạn đang dùng

// 🟢 Lấy tất cả thể loại
router.get("/", GenreController.getAll);

// 🟢 Lấy thể loại theo ID
router.get("/:id", GenreController.getById);

// 🟢 Tạo mới thể loại
router.post("/", GenreController.create);

// 🟡 Cập nhật thể loại
router.put("/:id", GenreController.update);

// 🔴 Xóa thể loại
router.delete("/:id", GenreController.delete);

module.exports = router;
