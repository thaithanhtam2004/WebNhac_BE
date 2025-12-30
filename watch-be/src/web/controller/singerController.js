const SingerService = require("../../services/singerService");
const cloudinary = require("../../utils/config/cloudinary");

class SingerController {
  async getAll(req, res) {
    try {
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

  // 🟢 Tạo nghệ sĩ
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

  // 🟡 Cập nhật
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

  // 🔴 Xóa
  async delete(req, res) {
    try {
      const result = await SingerService.deleteSinger(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SingerController();