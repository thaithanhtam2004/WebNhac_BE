const PlaylistService = require(".././playlist.service");

class PlaylistController {
  // 🟩 Lấy tất cả playlist
  async getAll(req, res) {
    try {
      const playlists = await PlaylistService.getAllPlaylists();
      res.status(200).json({ success: true, data: playlists });
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách playlist:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách playlist",
        error: err.message,
      });
    }
  }

  // 🟩 Lấy playlist theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const playlist = await PlaylistService.getPlaylistById(id);

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy playlist",
        });
      }

      res.status(200).json({ success: true, data: playlist });
    } catch (err) {
      console.error("❌ Lỗi khi lấy playlist theo ID:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy thông tin playlist",
        error: err.message,
      });
    }
  }

  // 🟩 Lấy playlist theo user
  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const playlists = await PlaylistService.getPlaylistsByUser(userId);
      res.status(200).json({ success: true, data: playlists });
    } catch (err) {
      console.error("❌ Lỗi khi lấy playlist của user:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy playlist của người dùng",
        error: err.message,
      });
    }
  }

  // 🟩 Tạo playlist mới
  async create(req, res) {
    try {
      const { name, userId } = req.body;

      if (!name || !userId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên playlist hoặc ID người dùng",
        });
      }

      const result = await PlaylistService.createPlaylist(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo playlist thành công",
        playlistId: result.playlistId,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo playlist:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Tạo playlist thất bại",
      });
    }
  }

  // 🟩 Cập nhật playlist
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await PlaylistService.updatePlaylist(id, req.body);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy playlist để cập nhật",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật playlist thành công",
        data: result,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật playlist:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật playlist thất bại",
      });
    }
  }

  // 🟩 Xóa playlist
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await PlaylistService.deletePlaylist(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy playlist để xóa",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã xóa playlist thành công",
      });
    } catch (err) {
      console.error("❌ Lỗi xóa playlist:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Không thể xóa playlist",
      });
    }
  }

  // 🟩 Thêm bài hát vào playlist
  async addSong(req, res) {
    try {
      const { playlistId, songId } = req.body;
      if (!playlistId || !songId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu playlistId hoặc songId",
        });
      }

      const result = await PlaylistService.addSongToPlaylist(playlistId, songId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi thêm bài hát vào playlist:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Thêm bài hát thất bại",
      });
    }
  }

  // 🟩 Xóa bài hát khỏi playlist
  async removeSong(req, res) {
    try {
      const { playlistId, songId } = req.body;
      if (!playlistId || !songId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu playlistId hoặc songId",
        });
      }

      const result = await PlaylistService.removeSongFromPlaylist(playlistId, songId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi xóa bài hát khỏi playlist:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Xóa bài hát thất bại",
      });
    }
  }
}

module.exports = new PlaylistController();
