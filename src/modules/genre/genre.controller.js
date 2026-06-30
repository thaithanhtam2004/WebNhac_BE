const GenreService = require("./genre.service");

class GenreController {
  async getAll(req, res) {
    try {
      const { page, limit, search, sortBy, sortOrder, order, visibility } = req.query;
      if (page || limit || search || visibility) {
        const result = await GenreService.getAllGenresPaginated({
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
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { name, description } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập tên thể loại" });
      }

      const result = await GenreService.createGenre({ name, description });
      res.status(201).json(result);
    } catch (err) {
      console.error("❌ Lỗi tạo thể loại:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const { name, description } = req.body;
      const genreId = req.params.id;

      const result = await GenreService.updateGenre(genreId, { name, description });
      res.status(200).json(result);
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await GenreService.deleteGenre(req.params.id);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleVisibility(req, res) {
    try {
      const response = await GenreService.toggleVisibility(req.params.id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { genreIds } = req.body;
      if (!genreIds || !Array.isArray(genreIds)) {
        return res.status(400).json({ error: "Thiếu danh sách genreIds" });
      }
      const response = await GenreService.bulkDelete(genreIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkToggleVisibility(req, res) {
    try {
      const { genreIds } = req.body;
      if (!genreIds || !Array.isArray(genreIds)) {
        return res.status(400).json({ error: "Thiếu danh sách genreIds" });
      }
      const response = await GenreService.bulkToggleVisibility(genreIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new GenreController();
