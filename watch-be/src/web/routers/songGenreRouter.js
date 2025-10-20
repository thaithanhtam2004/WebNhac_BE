const express = require("express");
const router = express.Router();

const SongGenreController = require("../controller/songGenreController");

// Lấy danh sách thể loại của một bài hát
router.get("/song/:songId", SongGenreController.getGenresBySong);

// Lấy danh sách bài hát theo thể loại
router.get("/genre/:genreId", SongGenreController.getSongsByGenre);

// Thêm thể loại cho bài hát
router.post("/:songId/:genreId", SongGenreController.addGenreToSong);

// Cập nhật toàn bộ danh sách thể loại của bài hát
router.put("/:songId", SongGenreController.updateSongGenres);

// Xóa thể loại khỏi bài hát
router.delete("/:songId/:genreId", SongGenreController.removeGenreFromSong);

module.exports = router;
