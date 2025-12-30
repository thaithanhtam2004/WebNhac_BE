const { ulid } = require("ulid");
const GenreRepository = require("../infras/repositories/genreRepository");

const GenreService = {
  async getAllGenres() {
    return await GenreRepository.findAll();
  },

  async getGenreById(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");
    return genre;
  },

  // 🟢 Tạo thể loại mới
  async createGenre(data) {
    if (!data.name || !data.name.trim()) throw new Error("Tên thể loại không được để trống");
    const cleanName = data.name.trim();

    // 1. Kiểm tra trùng tên
    const isDuplicate = await GenreRepository.checkDuplicate(cleanName);
    if (isDuplicate) {
      throw new Error(`Thể loại '${cleanName}' đã tồn tại.`);
    }

    const genreId = ulid();
    await GenreRepository.create({
      genreId,
      name: cleanName,
      description: data.description?.trim() || null,
    });

    return { message: "Tạo thể loại thành công", genreId };
  },

  // 🟡 Cập nhật thể loại
  async updateGenre(genreId, data) {
    const existing = await GenreRepository.findById(genreId);
    if (!existing) throw new Error("Thể loại không tồn tại");

    const cleanName = data.name ? data.name.trim() : existing.name;

    // 1. Nếu tên thay đổi, kiểm tra trùng lặp
    if (cleanName !== existing.name) {
      const isDuplicate = await GenreRepository.checkDuplicate(cleanName, genreId);
      if (isDuplicate) {
        throw new Error(`Cập nhật thất bại: Thể loại '${cleanName}' đã tồn tại.`);
      }
    }

    const success = await GenreRepository.update(genreId, {
      name: cleanName,
      description: data.description?.trim() || null,
    });

    if (!success) throw new Error("Cập nhật thể loại thất bại");
    return { message: "Cập nhật thể loại thành công" };
  },

  // 🔴 Xóa thể loại (An toàn dữ liệu)
  async deleteGenre(genreId) {
    const existing = await GenreRepository.findById(genreId);
    if (!existing) throw new Error("Thể loại không tồn tại");

    // 1. Kiểm tra xem có bài hát nào thuộc thể loại này không
    const hasSongs = await GenreRepository.hasSongs(genreId);
    if (hasSongs) {
      throw new Error(`Không thể xóa '${existing.name}' vì đang có bài hát thuộc thể loại này.`);
    }

    const success = await GenreRepository.delete(genreId);
    if (!success) throw new Error("Xóa thể loại thất bại");

    return { message: "Đã xóa thể loại thành công" };
  },
};

module.exports = GenreService;