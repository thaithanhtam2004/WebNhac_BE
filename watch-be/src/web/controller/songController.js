const SongService = require("../../services/songService");

class SongController {
  // 🟢 Lấy tất cả bài hát
  async getAll(req, res) {
    try {
      const songs = await SongService.getAllSongs();
      return res.status(200).json({ success: true, data: songs });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy bài hát theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const song = await SongService.getSongById(id);
      return res.status(200).json({ success: true, data: song });
    } catch (err) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo bài hát mới
  async create(req, res) {
    try {
      const result = await SongService.createSong(req.body);
      return res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Cập nhật bài hát
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await SongService.updateSong(id, req.body);
      return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Xóa bài hát
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await SongService.deleteSong(id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Cập nhật lượt nghe (views)
  async updateViews(req, res) {
    try {
      const { id } = req.params;
      const result = await SongService.increaseView(id);
      return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SongController();
