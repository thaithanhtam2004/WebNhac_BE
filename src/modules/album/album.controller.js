const AlbumService = require("./album.service");
const cloudinary = require("../../config/cloudinary");

class AlbumController {
  // Helper chuẩn hóa ngày
  static normalizeDate(dateString) {
    if (!dateString) return null;
    if (dateString.includes('/')) {
        const [d, m, y] = dateString.split('/');
        return `${y}-${m}-${d}`;
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }

  async getAll(req, res) {
    try {
      const { page, limit, search, sortBy, sortOrder, order, visibility } = req.query;
      if (page || limit || search || visibility) {
        const result = await AlbumService.getAllAlbumsPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || "",
          sortBy: sortBy || "createdAt",
          sortOrder: order || sortOrder || "desc",
          visibility: visibility || "all",
        });
        return res.status(200).json({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      }
      
      const albums = await AlbumService.getAllAlbums();
      res.status(200).json({ success: true, data: albums });
    } catch (err) {
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
      const { name, singerId, description, releaseDate } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên album" });
      }

      let coverUrl = "";
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          { resource_type: "image", folder: "albums" }
        );
        coverUrl = uploadRes.secure_url;
      }

      const normalizedDate = AlbumController.normalizeDate(releaseDate);

      const result = await AlbumService.createAlbum({
        name,
        singerId,
        description,
        coverUrl,
        releaseDate: normalizedDate,
      });

      res.status(201).json(result);
    } catch (err) {
      console.error("❌ Lỗi tạo album:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, singerId, description, releaseDate } = req.body;
      const albumId = req.params.id;

      let coverUrl;
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          { resource_type: "image", folder: "albums" }
        );
        coverUrl = uploadRes.secure_url;
      }

      const normalizedDate = AlbumController.normalizeDate(releaseDate);

      const result = await AlbumService.updateAlbum(albumId, {
        name,
        singerId,
        description,
        coverUrl,
        releaseDate: normalizedDate,
      });

      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await AlbumService.deleteAlbum(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleVisibility(req, res) {
    try {
      const response = await AlbumService.toggleVisibility(req.params.id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { albumIds } = req.body;
      if (!albumIds || !Array.isArray(albumIds)) {
        return res.status(400).json({ error: "Thiếu danh sách albumIds" });
      }
      const response = await AlbumService.bulkDelete(albumIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkToggleVisibility(req, res) {
    try {
      const { albumIds } = req.body;
      if (!albumIds || !Array.isArray(albumIds)) {
        return res.status(400).json({ error: "Thiếu danh sách albumIds" });
      }
      const response = await AlbumService.bulkToggleVisibility(albumIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AlbumController();
