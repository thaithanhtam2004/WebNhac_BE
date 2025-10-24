const express = require("express");
const router = express.Router();
const AlbumSongController = require("../controller/albumSongController");

// 🟢 Lấy tất cả bài hát trong album
router.get("/:albumId/songs", AlbumSongController.getSongsByAlbum);

// 🟢 Thêm bài hát vào album
router.post("/:albumId/songs/:songId", AlbumSongController.addSongToAlbum);

// 🟢 Cập nhật toàn bộ danh sách bài hát trong album
router.put("/:albumId/songs", AlbumSongController.updateAlbumSongs);

// 🟢 Xóa bài hát khỏi album
router.delete("/:albumId/songs/:songId", AlbumSongController.removeSongFromAlbum);

module.exports = router;
