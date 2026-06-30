const express = require("express");
const router = express.Router();
const AlbumSongController = require("./albumSong.controller");

// ➕ Thêm một bài hát vào album
router.post("/:albumId/songs/:songId", AlbumSongController.addSongToAlbum);

// 🆕 Thêm nhiều bài hát vào album
router.post("/:albumId/songs", AlbumSongController.addMultipleSongsToAlbum);

// 🔄 Cập nhật danh sách bài hát trong album
router.put("/:albumId/songs", AlbumSongController.updateAlbumSongs);

// 📖 Lấy danh sách bài hát trong album
router.get("/:albumId/songs", AlbumSongController.getSongsByAlbum);

// ❌ Xóa bài hát khỏi album
router.delete("/:albumId/songs/:songId", AlbumSongController.removeSongFromAlbum);

module.exports = router;