const SingerService = require("./singer.service");
const cloudinary = require("../../config/cloudinary");

class SingerController {
  async getAll(req, res) {
    try {
      const { page, limit, search, sortBy, sortOrder, order, visibility } = req.query;
      if (page || limit || search || visibility) {
        const result = await SingerService.getAllSingersPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || "",
          sortBy: sortBy || "name",
          sortOrder: order || sortOrder || "asc",
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
      
      const singers = await SingerService.getAllSingers();
      res.status(200).json({ success: true, data: singers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const singer = await SingerService.getSingerById(req.params.id);
      res.status(200).json({ success: true, data: singer });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { name, bio } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên nghệ sĩ" });
      }

      let imageUrl = "";
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          { resource_type: "image", folder: "singers" }
        );
        imageUrl = uploadRes.secure_url;
      }

      const result = await SingerService.createSinger({
        name,
        bio,
        imageUrl,
      });

      res.status(201).json(result);
    } catch (err) {
      console.error("❌ Lỗi tạo nghệ sĩ:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, bio } = req.body;
      const singerId = req.params.id;

      let imageUrl;
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          { resource_type: "image", folder: "singers" }
        );
        imageUrl = uploadRes.secure_url;
      }

      const result = await SingerService.updateSinger(singerId, {
        name,
        bio,
        imageUrl,
      });

      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await SingerService.deleteSinger(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleVisibility(req, res) {
    try {
      const response = await SingerService.toggleVisibility(req.params.id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { singerIds } = req.body;
      if (!singerIds || !Array.isArray(singerIds)) {
        return res.status(400).json({ error: "Thiếu danh sách singerIds" });
      }
      const response = await SingerService.bulkDelete(singerIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkToggleVisibility(req, res) {
    try {
      const { singerIds } = req.body;
      if (!singerIds || !Array.isArray(singerIds)) {
        return res.status(400).json({ error: "Thiếu danh sách singerIds" });
      }
      const response = await SingerService.bulkToggleVisibility(singerIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new SingerController();
