const SongGenreService = require("../../services/songGenreService");

const SongGenreController = {
  // Lấy danh sách thể loại của bài hát
  async getGenresBySong(req, res) {
    try {
      const { songId } = req.params;
      const genres = await SongGenreService.getGenresBySong(songId);
      res.status(200).json({
        success: true,
        data: genres,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message || "Không thể lấy danh sách thể loại của bài hát",
      });
    }
  },

  // Lấy danh sách bài hát theo thể loại
  async getSongsByGenre(req, res) {
    try {
      const { genreId } = req.params;
      const songs = await SongGenreService.getSongsByGenre(genreId);
      res.status(200).json({
        success: true,
        data: songs,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message || "Không thể lấy danh sách bài hát theo thể loại",
      });
    }
  },

  // Thêm thể loại cho bài hát
 async addGenreToSong(req, res) {
  try {
    const { songId, genreId } = req.body; // <-- dùng body thay vì params
    const result = await SongGenreService.addGenreToSong(songId, genreId);
    res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Thêm thể loại cho bài hát thất bại",
    });
  }
}
,

  // Xóa thể loại khỏi bài hát
  async removeGenreFromSong(req, res) {
    try {
      const { songId, genreId } = req.params;
      const result = await SongGenreService.removeGenreFromSong(songId, genreId);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Xóa thể loại khỏi bài hát thất bại",
      });
    }
  },

  // Cập nhật toàn bộ danh sách thể loại cho bài hát
  async updateSongGenres(req, res) {
    try {
      const { songId } = req.params;
      const { genreIds } = req.body;

      if (!Array.isArray(genreIds) || genreIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Danh sách thể loại không hợp lệ",
        });
      }

      const result = await SongGenreService.updateSongGenres(songId, genreIds);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật danh sách thể loại thất bại",
      });
    }
  },
};

module.exports = SongGenreController;
