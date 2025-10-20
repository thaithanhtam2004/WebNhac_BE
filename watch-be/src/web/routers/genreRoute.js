const express = require("express");
const router = express.Router();

const GenreController = require("../controller/genreController");

// Thêm thể loại mới
router.post("/", GenreController.createGenre);

// Lấy danh sách tất cả thể loại
router.get("/", GenreController.getAllGenres);

// Lấy thông tin thể loại theo ID
router.get("/:id", GenreController.getGenreById);

// Cập nhật thể loại
router.put("/:id", GenreController.updateGenre);

// Xóa thể loại
router.delete("/:id", GenreController.deleteGenre);

module.exports = router;
