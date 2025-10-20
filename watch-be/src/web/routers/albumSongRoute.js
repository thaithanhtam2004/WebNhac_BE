const express = require("express");
const router = express.Router();

const AlbumSongController = require("../controller/albumSongController");

// Lấy danh sách bài hát của một album
router.get("/album/:albumId", AlbumSongController.getSongsByAlbum);

// Thêm bài hát vào album
router.post("/:albumId/:songId", AlbumSongController.addSongToAlbum);

// Cập nhật toàn bộ danh sách bài hát của album
router.put("/:albumId", AlbumSongController.updateAlbumSongs);

// Xóa bài hát khỏi album
router.delete("/:albumId/:songId", AlbumSongController.removeSongFromAlbum);

module.exports = router;
