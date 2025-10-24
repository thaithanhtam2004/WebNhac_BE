const AlbumService = require("../../services/albumService");

class AlbumController {
  // 🟢 Lấy tất cả album
  async getAll(req, res) {
    try {
      const albums = await AlbumService.getAllAlbums();
      res.status(200).json({
        success: true,
        data: albums,
      });
    } catch (err) {
      console.error("❌ Lỗi khi lấy tất cả album:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Không thể lấy danh sách album",
      });
    }
  }

  // 🟢 Lấy album theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await AlbumService.getAlbumById(id);
      res.status(200).json({
        success: true,
        data: album,
      });
    } catch (err) {
      console.error("❌ Lỗi khi lấy album theo ID:", err);
      res.status(404).json({
        success: false,
        message: err.message || "Không tìm thấy album",
      });
    }
  }

  // 🟢 Tạo mới album
  async create(req, res) {
    try {
      if (!req.body.name || !req.body.singerId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên album hoặc ca sĩ",
        });
      }

      const result = await AlbumService.createAlbum(req.body, req.file);
      res.status(201).json({
        success: true,
        message: result.message,
        albumId: result.albumId,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Tạo album thất bại",
      });
    }
  }

  // 🟢 Cập nhật album
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await AlbumService.updateAlbum(id, req.body, req.file);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật album thất bại",
      });
    }
  }

  // 🟢 Xóa album
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await AlbumService.deleteAlbum(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi xóa album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Xóa album thất bại",
      });
    }
  }
}

module.exports = new AlbumController();
