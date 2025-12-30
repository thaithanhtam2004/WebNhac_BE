const GenreService = require("../../services/genreService");

class GenreController {
  async getAll(req, res) {
    try {
      const genres = await GenreService.getAllGenres();
      res.status(200).json({ success: true, data: genres });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const genre = await GenreService.getGenreById(req.params.id);
      res.status(200).json({ success: true, data: genre });
    } catch (err) {
      const status = err.message.includes("Không tìm thấy") ? 404 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo
  async create(req, res) {
    try {
      const { name, description } = req.body;
      
      const result = await GenreService.createGenre({ name, description });

      res.status(201).json(result);
    } catch (err) {
      console.error("❌ Lỗi tạo thể loại:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật
  async update(req, res) {
    try {
      const { name, description } = req.body;
      const result = await GenreService.updateGenre(req.params.id, { name, description });
      
      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Lỗi cập nhật thể loại:", err);
      const status = err.message.includes("không tồn tại") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  // 🔴 Xóa
  async delete(req, res) {
    try {
      const result = await GenreService.deleteGenre(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Lỗi xóa thể loại:", err);
      const status = err.message.includes("không tồn tại") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }
}

module.exports = new GenreController();