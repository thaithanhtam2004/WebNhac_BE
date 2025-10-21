const GenreService = require("../../services/genreService");

class GenreController {
  // Tạo thể loại mới
  async createGenre(req, res) {
    try {
      const { name, description } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Tên thể loại là bắt buộc",
        });
      }

      const result = await GenreService.createGenre({ name, description });
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.genre,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Thêm thể loại thất bại",
      });
    }
  }

  // Lấy danh sách tất cả thể loại
  async getAllGenres(req, res) {
    try {
      const list = await GenreService.getAllGenres();
      res.status(200).json({
        success: true,
        data: list,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Không thể lấy danh sách thể loại",
      });
    }
  }

  // Lấy thông tin thể loại theo ID
  async getGenreById(req, res) {
    try {
      const { id } = req.params;
      const genre = await GenreService.getGenreById(id);
      res.status(200).json({
        success: true,
        data: genre,
      });
    } catch (err) {
      res.status(404).json({
        success: false,
        message: err.message || "Không tìm thấy thể loại",
      });
    }
  }

  // Cập nhật thể loại
  async updateGenre(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!name && !description) {
        return res.status(400).json({
          success: false,
          message: "Cần cung cấp ít nhất một trường để cập nhật",
        });
      }

      const result = await GenreService.updateGenre(id, req.body);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật thể loại thất bại",
      });
    }
  }

  // Xóa thể loại
  async deleteGenre(req, res) {
    try {
      const { id } = req.params;
      const result = await GenreService.deleteGenre(id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message || "Xóa thể loại thất bại",
      });
    }
  }
}

module.exports = new GenreController();
