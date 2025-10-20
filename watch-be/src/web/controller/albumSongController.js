const AlbumSongService = require("../../services/albumSongService");

class AlbumSongController {
  // Lấy danh sách bài hát của album
  async getSongsByAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const songs = await AlbumSongService.getSongsByAlbum(albumId);
      res.status(200).json({
        success: true,
        data: songs,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message || "Không thể lấy danh sách bài hát của album",
      });
    }
  }

  // Thêm bài hát vào album
  async addSongToAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;
      const { trackNumber } = req.body;

      const result = await AlbumSongService.addSongToAlbum(albumId, songId, trackNumber);
      res.status(201).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Thêm bài hát vào album thất bại",
      });
    }
  }

  // Xóa bài hát khỏi album
  async removeSongFromAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;
      const result = await AlbumSongService.removeSongFromAlbum(albumId, songId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Xóa bài hát khỏi album thất bại",
      });
    }
  }

  // Cập nhật toàn bộ danh sách bài hát trong album
  async updateAlbumSongs(req, res) {
    try {
      const { albumId } = req.params;
      const { songList } = req.body;
      /**
       * songList = [
       *   { songId: "...", trackNumber: 1 },
       *   { songId: "...", trackNumber: 2 },
       *   ...
       * ]
       */

      if (!Array.isArray(songList) || songList.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Danh sách bài hát không hợp lệ",
        });
      }

      const result = await AlbumSongService.updateAlbumSongs(albumId, songList);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật danh sách bài hát thất bại",
      });
    }
  }
}

module.exports = new AlbumSongController();
