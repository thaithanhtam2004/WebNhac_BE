const GenreService = require("../../services/genreService");

class GenreController {
  // 🟢 Lấy tất cả thể loại
  async getAll(req, res) {
    try {
      const genres = await GenreService.getAllGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (err) {
      console.error("❌ Lỗi lấy danh sách thể loại:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy thể loại theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const genre = await GenreService.getGenreById(id);

      res.status(200).json({ success: true, data: genre });
    } catch (err) {
      console.error("❌ Lỗi lấy thể loại theo ID:", err);
      const status = err.message.includes("Không tìm thấy") ? 404 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo thể loại mới
  async create(req, res) {
    try {
      console.log("📥 Request body:", req.body);
      const { name, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tên thể loại không được để trống",
        });
      }

      const result = await GenreService.createGenre({
        name: name.trim(),
        description: description?.trim() || null,
      });

      res.status(201).json({
        success: true,
        message: result.message,
        genreId: result.genreId,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo thể loại:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật thể loại
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tên thể loại không được để trống",
        });
      }

      const result = await GenreService.updateGenre(id, {
        name: name.trim(),
        description: description?.trim() || null,
      });

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật thể loại:", err);
      const status = err.message.includes("không tồn tại") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  // 🔴 Xóa thể loại
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await GenreService.deleteGenre(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi xóa thể loại:", err);
      const status = err.message.includes("không tồn tại") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GenreController();
