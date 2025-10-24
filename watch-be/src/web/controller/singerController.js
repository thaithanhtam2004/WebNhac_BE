const SingerService = require("../../services/singerService");
const cloudinary = require("../../utils/config/cloudinary");

class SingerController {
  // 🟢 Lấy tất cả nghệ sĩ
  async getAll(req, res) {
    try {
      const singers = await SingerService.getAllSingers();
      res.status(200).json({ success: true, data: singers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy nghệ sĩ theo ID
  async getById(req, res) {
    try {
      const singer = await SingerService.getSingerById(req.params.id);
      res.status(200).json({ success: true, data: singer });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo nghệ sĩ mới (upload ảnh)
  async create(req, res) {
    try {
      console.log("📥 Request body:", req.body);
      console.log("📁 File:", req.file);

      const { name, bio } = req.body;

      // Validation
      if (!name?.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập tên nghệ sĩ" 
        });
      }

      let imageUrl = "";

      // 🆙 Upload ảnh lên Cloudinary (nếu có)
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          {
            resource_type: "image",
            folder: "singers",
          }
        );
        imageUrl = uploadRes.secure_url;
        console.log("✅ Uploaded image:", imageUrl);
      }

      const result = await SingerService.createSinger({
        name: name.trim(),
        bio: bio?.trim() || "",
        imageUrl,
      });

      res.status(201).json({ 
        success: true, 
        message: result.message,
        singerId: result.singerId 
      });
    } catch (err) {
      console.error("❌ Lỗi tạo nghệ sĩ:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật nghệ sĩ (có thể thay ảnh mới)
  async update(req, res) {
    try {
      const { name, bio } = req.body;
      const singerId = req.params.id;

      const existing = await SingerService.getSingerById(singerId);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy nghệ sĩ" });
      }

      let imageUrl = existing.imageUrl;

      // 🆙 Upload ảnh mới nếu có
      if (req.file) {
        const base64Image = req.file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${base64Image}`,
          {
            resource_type: "image",
            folder: "singers",
          }
        );
        imageUrl = uploadRes.secure_url;
        console.log("✅ Updated image:", imageUrl);
      }

      const result = await SingerService.updateSinger(singerId, {
        name: name?.trim() || existing.name,
        bio: bio !== undefined ? bio.trim() : existing.bio,
        imageUrl,
      });

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🔴 Xóa nghệ sĩ
  async delete(req, res) {
    try {
      const result = await SingerService.deleteSinger(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SingerController();