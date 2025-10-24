const AlbumService = require("../../services/albumService");

class AlbumController {
  // 🟩 Lấy tất cả album
  async getAll(req, res) {
    try {
      const albums = await AlbumService.getAllAlbums();
      res.status(200).json({ success: true, data: albums });
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách album:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách album",
        error: err.message,
      });
    }
  }

  // 🟩 Lấy album theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const album = await AlbumService.getAlbumById(id);

      if (!album) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy album",
        });
      }

      res.status(200).json({ success: true, data: album });
    } catch (err) {
      console.error("❌ Lỗi khi lấy album theo ID:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy thông tin album",
        error: err.message,
      });
    }
  }

  // 🟩 Tạo album mới
  async create(req, res) {
    try {
      const { name, singerId } = req.body;

      if (!name || !singerId) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên album hoặc ID ca sĩ",
        });
      }

      const result = await AlbumService.createAlbum(req.body, req.file);
      res.status(201).json({
        success: true,
        message: "Tạo album thành công",
        albumId: result.albumId,
        data: result.album,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Tạo album thất bại",
      });
    }
  }

  // 🟩 Cập nhật album
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await AlbumService.updateAlbum(id, req.body, req.file);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy album để cập nhật",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật album thành công",
        data: result,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật album:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật album thất bại",
      });
    }
  }

  // 🟩 Xóa album
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await AlbumService.deleteAlbum(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy album để xóa",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã xóa album thành công",
      });
    } catch (err) {
      console.error("❌ Lỗi xóa album:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Không thể xóa album",
      });
    }
  }
}

module.exports = new AlbumController();
