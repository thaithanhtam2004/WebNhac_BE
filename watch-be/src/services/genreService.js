const GenreRepository = require("../infras/repositories/genreRepository");

const GenreService = {
  // Lấy danh sách tất cả thể loại
  async getAllGenres() {
    const genres = await GenreRepository.findAll();
    return genres;
  },

  // Lấy thông tin thể loại theo ID
  async getGenreById(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");
    return genre;
  },

  // Tạo thể loại mới
  async createGenre({ name, description }) {
    const existing = await GenreRepository.findByName(name);
    if (existing) throw new Error("Tên thể loại đã tồn tại");

    const newGenre = await GenreRepository.create({ name, description });
    return {
      message: "Thêm thể loại thành công",
      genre: newGenre,
    };
  },

  // Cập nhật thể loại
  async updateGenre(genreId, data) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const success = await GenreRepository.update(genreId, data);
    if (!success) throw new Error("Cập nhật thể loại thất bại");

    return { message: "Cập nhật thể loại thành công" };
  },

  // Xóa thể loại
  async deleteGenre(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const success = await GenreRepository.delete(genreId);
    if (!success) throw new Error("Xóa thể loại thất bại");

    return { message: "Xóa thể loại thành công" };
  },
};

module.exports = GenreService;
