const { ulid } = require("ulid");
const GenreRepository = require("./genre.repository");

const GenreService = {
  async getAllGenres() {
    return await GenreRepository.findAll();
  },

  async getAllGenresPaginated(params) {
    return await GenreRepository.findAllPaginated(params);
  },

  async getGenreById(genreId) {
    if (!genreId) throw new Error("Genre ID không hợp lệ");
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");
    return genre;
  },

  async createGenre(data) {
    if (!data.name || !data.name.trim()) throw new Error("Tên thể loại không được để trống");
    
    const existingGenre = await GenreRepository.findByName(data.name.trim());
    if (existingGenre) throw new Error("Thể loại này đã tồn tại");
    
    const genreId = ulid();
    
    await GenreRepository.create({
      genreId,
      name: data.name.trim(),
      description: data.description?.trim() || "",
    });

    return { success: true, message: "Tạo thể loại thành công", genreId };
  },

  async updateGenre(genreId, data) {
    const currentGenre = await GenreRepository.findById(genreId);
    if (!currentGenre) throw new Error("Không tìm thấy thể loại");

    const updateData = {};
    if (data.name && data.name.trim()) {
      if (data.name.trim() !== currentGenre.name) {
        const existingGenre = await GenreRepository.findByName(data.name.trim());
        if (existingGenre) throw new Error("Tên thể loại đã được sử dụng");
      }
      updateData.name = data.name.trim();
    }
    if (data.description !== undefined) updateData.description = data.description.trim();

    if (Object.keys(updateData).length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const success = await GenreRepository.update(genreId, updateData);
    if (!success) throw new Error("Cập nhật thất bại");

    return { success: true, message: "Cập nhật thể loại thành công" };
  },

  async deleteGenre(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const hasSongs = await GenreRepository.hasSongs(genreId);
    if (hasSongs) {
      throw new Error(`Không thể xóa '${genre.name}' vì đang có bài hát thuộc thể loại này.`);
    }

    const success = await GenreRepository.delete(genreId);
    if (!success) throw new Error("Xóa thể loại thất bại");

    return { success: true, message: "Xóa thể loại thành công" };
  },

  async toggleVisibility(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const success = await GenreRepository.update(genreId, { isHidden: !genre.isHidden });
    if (!success) throw new Error("Cập nhật trạng thái thất bại");

    return { success: true, message: "Cập nhật trạng thái thành công" };
  },

  async bulkDelete(genreIds) {
    if (!genreIds || genreIds.length === 0) throw new Error("Danh sách ID rỗng");
    
    let cannotDelete = [];
    for (const id of genreIds) {
      const hasSongs = await GenreRepository.hasSongs(id);
      if (hasSongs) cannotDelete.push(id);
    }
    if (cannotDelete.length > 0) {
      throw new Error(`Không thể xóa ${cannotDelete.length} thể loại vì đang có bài hát liên kết.`);
    }

    const count = await GenreRepository.bulkDelete(genreIds);
    return { success: true, message: `Đã xóa ${count} thể loại thành công` };
  },

  async bulkToggleVisibility(genreIds) {
    if (!genreIds || genreIds.length === 0) throw new Error("Danh sách ID rỗng");
    const count = await GenreRepository.bulkToggleVisibility(genreIds);
    return { success: true, message: `Đã cập nhật trạng thái ${count} thể loại` };
  },
};

module.exports = GenreService;
