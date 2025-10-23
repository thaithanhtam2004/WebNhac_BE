const AlbumService = require("../../services/albumService");

class AlbumController {
  async getAll(req, res) {
    try {
      const albums = await AlbumService.getAllAlbums();
      res.status(200).json({ success: true, data: albums });
    } catch (err) {
      console.error("❌ Lỗi lấy album:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const album = await AlbumService.getAlbumById(req.params.id);
      res.status(200).json({ success: true, data: album });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const result = await AlbumService.createAlbum(req.body, req.file);
      res.status(201).json({
        success: true,
        message: result.message,
        albumId: result.albumId,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const result = await AlbumService.updateAlbum(req.params.id, req.body, req.file);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await AlbumService.deleteAlbum(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AlbumController();
