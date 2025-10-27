const { ulid } = require("ulid");
const GenreRepository = require("../infras/repositories/genreRepository");

const GenreService = {
  // 🟢 Lấy tất cả thể loại
  async getAllGenres() {
    return await GenreRepository.findAll();
  },

  // 🟢 Lấy thể loại theo ID
  async getGenreById(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");
    return genre;
  },

  // 🟢 Tạo thể loại mới
  async createGenre(data) {
    const genreId = ulid();

    await GenreRepository.create({
      genreId,
      name: data.name,
      description: data.description || null,
    });

    return { message: "Tạo thể loại thành công", genreId };
  },

  // 🟡 Cập nhật thể loại
  async updateGenre(genreId, data) {
    const existing = await GenreRepository.findById(genreId);
    if (!existing) throw new Error("Thể loại không tồn tại");

    const success = await GenreRepository.update(genreId, {
      name: data.name,
      description: data.description || null,
    });

    if (!success) throw new Error("Cập nhật thể loại thất bại");
    return { message: "Cập nhật thể loại thành công" };
  },

  // 🔴 Xóa thể loại
  async deleteGenre(genreId) {
    const existing = await GenreRepository.findById(genreId);
    if (!existing) throw new Error("Thể loại không tồn tại");

    const success = await GenreRepository.delete(genreId);
    if (!success) throw new Error("Xóa thể loại thất bại");

    return { message: "Đã xóa thể loại thành công" };
  },
};

module.exports = GenreService;
