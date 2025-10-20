const SongGenreRepository = require("../infras/repositories/songGenreRepository");
const SongRepository = require("../infras/repositories/songRepository");
const GenreRepository = require("../infras/repositories/genreRepository");

const SongGenreService = {
  // Lấy danh sách thể loại của một bài hát
  async getGenresBySong(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const genres = await SongGenreRepository.getGenresBySong(songId);
    return genres;
  },

  // Lấy danh sách bài hát thuộc một thể loại
  async getSongsByGenre(genreId) {
    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const songs = await SongGenreRepository.getSongsByGenre(genreId);
    return songs;
  },

  // Thêm thể loại cho bài hát
  async addGenreToSong(songId, genreId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const success = await SongGenreRepository.addGenreToSong(songId, genreId);
    if (!success) throw new Error("Thêm thể loại thất bại");

    return { message: "Đã thêm thể loại cho bài hát" };
  },

  // Xóa thể loại khỏi bài hát
  async removeGenreFromSong(songId, genreId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const genre = await GenreRepository.findById(genreId);
    if (!genre) throw new Error("Không tìm thấy thể loại");

    const success = await SongGenreRepository.removeGenreFromSong(songId, genreId);
    if (!success) throw new Error("Xóa thể loại khỏi bài hát thất bại");

    return { message: "Đã xóa thể loại khỏi bài hát" };
  },

  // Cập nhật toàn bộ danh sách thể loại cho bài hát
  async updateSongGenres(songId, genreIds) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    if (!Array.isArray(genreIds) || genreIds.length === 0) {
      throw new Error("Danh sách thể loại không hợp lệ");
    }

    const success = await SongGenreRepository.updateSongGenres(songId, genreIds);
    if (!success) throw new Error("Cập nhật thể loại cho bài hát thất bại");

    return { message: "Đã cập nhật danh sách thể loại cho bài hát" };
  },
};

module.exports = SongGenreService;
