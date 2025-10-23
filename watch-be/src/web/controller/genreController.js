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
      const genre = await GenreService.getGenreById(req.params.id);
      if (!genre) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy thể loại" });
      }
      res.status(200).json({ success: true, data: genre });
    } catch (err) {
      console.error("❌ Lỗi lấy thể loại theo ID:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo thể loại mới
  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ success: false, message: "Tên thể loại không được để trống" });
      }

      const result = await GenreService.createGenre({ name, description });

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
      const { name, description } = req.body;
      const genreId = req.params.id;

      const result = await GenreService.updateGenre(genreId, { name, description });

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi cập nhật thể loại:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🔴 Xóa thể loại
  async delete(req, res) {
    try {
      const genreId = req.params.id;
      const result = await GenreService.deleteGenre(genreId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi xóa thể loại:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GenreController();
