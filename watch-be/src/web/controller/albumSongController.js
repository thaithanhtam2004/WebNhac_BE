const AlbumSongService = require("../../services/albumSongService");

class AlbumSongController {
  // 🟩 Thêm một bài hát vào album
  async addSongToAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;

      if (!albumId || !songId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu albumId hoặc songId",
        });
      }

      const result = await AlbumSongService.addSongToAlbum(albumId, songId);
      res.status(201).json({
        success: true,
        message: "Đã thêm bài hát vào album",
        data: result,
      });
    } catch (err) {
      console.error("❌ Lỗi thêm bài hát vào album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Không thể thêm bài hát vào album",
      });
    }
  }

  // 🟩 Thêm nhiều bài hát vào album
  async addMultipleSongsToAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const { songIds } = req.body;

      if (!albumId || !Array.isArray(songIds) || songIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Danh sách bài hát không hợp lệ",
        });
      }

      const results = await AlbumSongService.addMultipleSongsToAlbum(albumId, songIds);

      res.status(201).json({
        success: true,
        message: "Đã thêm nhiều bài hát vào album",
        data: results,
      });
    } catch (err) {
      console.error("❌ Lỗi thêm nhiều bài hát:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Không thể thêm nhiều bài hát vào album",
      });
    }
  }

  // 🟩 Cập nhật toàn bộ danh sách bài hát của album
  async updateAlbumSongs(req, res) {
    try {
      const { albumId } = req.params;
      const { songIds } = req.body;

      if (!albumId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu albumId",
        });
      }

      const result = await AlbumSongService.updateAlbumSongs(albumId, songIds);
      res.status(200).json({
        success: true,
        message: "Đã cập nhật danh sách bài hát trong album",
        data: result,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Không thể cập nhật album",
      });
    }
  }

  // 🟩 Lấy danh sách bài hát của album
  async getSongsByAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const songs = await AlbumSongService.getSongsByAlbum(albumId);
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      console.error("❌ Lỗi lấy bài hát của album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Không thể lấy danh sách bài hát",
      });
    }
  }

  // 🟩 Xóa một bài hát khỏi album
  async removeSongFromAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;

      if (!albumId || !songId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu albumId hoặc songId",
        });
      }

      await AlbumSongService.removeSongFromAlbum(albumId, songId);
      res.status(200).json({
        success: true,
        message: "Đã xóa bài hát khỏi album",
      });
    } catch (err) {
      console.error("❌ Lỗi xóa bài hát:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Không thể xóa bài hát khỏi album",
      });
    }
  }
}

module.exports = new AlbumSongController();
