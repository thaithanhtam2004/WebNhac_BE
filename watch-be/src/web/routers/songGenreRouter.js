const express = require("express");
const router = express.Router();
const SongGenreController = require("../controller/songGenreController");
router.get("/song/:songId", SongGenreController.getGenresBySong);

router.post("/", SongGenreController.addGenreToSong);
// PUT /api/song-genres/:songId — Cập nhật toàn bộ danh sách thể loại
router.put("/:songId", SongGenreController.updateSongGenres);

// DELETE /api/song-genres/:songId/:genreId — Xóa thể loại khỏi bài hát
router.delete("/:songId/:genreId", SongGenreController.removeGenreFromSong);

// GET /api/song-genres/genre/:genreId — Lấy danh sách bài hát theo thể loại
router.get("/genre/:genreId", SongGenreController.getSongsByGenre);

// GET /api/song-genres/song/:songId — Lấy danh sách thể loại của một bài hát
router.get("/song/:songId", SongGenreController.getGenresBySong);

module.exports = router;
