const AlbumSongRepository = require("../infras/repositories/albumSongRepository");
const SongRepository = require("../infras/repositories/songRepository");
const AlbumRepository = require("../infras/repositories/albumRepository");

const AlbumSongService = {
  // 🟢 Lấy danh sách bài hát trong album - FIX: Chỉ trả về songs
  async getSongsByAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return songs; // ✅ Trả về array songs thay vì object
  },

  // 🟢 Thêm một bài hát vào album
  async addSongToAlbum(albumId, songId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const success = await AlbumSongRepository.addSongToAlbum(albumId, songId);
    if (!success) throw new Error("Thêm bài hát vào album thất bại");

    return { message: "Đã thêm bài hát vào album" };
  },

  // 🟢 Thêm nhiều bài hát vào album
  async addMultipleSongsToAlbum(albumId, songIds) {
    if (!Array.isArray(songIds) || songIds.length === 0) {
      throw new Error("Danh sách bài hát không hợp lệ");
    }

    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    // Validate tất cả bài hát tồn tại
    for (const songId of songIds) {
      const song = await SongRepository.findById(songId);
      if (!song) throw new Error(`Bài hát với ID ${songId} không tồn tại`);
    }

    const success = await AlbumSongRepository.addMultipleSongsToAlbum(albumId, songIds);
    if (!success) throw new Error("Không thể thêm nhiều bài hát vào album");

    return { message: "Đã thêm nhiều bài hát vào album", count: songIds.length };
  },

  // 🟢 Cập nhật danh sách bài hát
  async updateAlbumSongs(albumId, songIds = []) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    // Validate tất cả bài hát tồn tại
    for (const songId of songIds) {
      const song = await SongRepository.findById(songId);
      if (!song) throw new Error(`Bài hát với ID ${songId} không tồn tại`);
    }

    const songs = songIds.map((songId, index) => ({
      songId,
      trackNumber: index + 1
    }));

    const success = await AlbumSongRepository.updateAlbumSongs(albumId, songs);
    if (!success) throw new Error("Cập nhật danh sách bài hát thất bại");

    return { message: "Đã cập nhật danh sách bài hát cho album" };
  },

  // 🟢 Xóa bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    const success = await AlbumSongRepository.removeSongFromAlbum(albumId, songId);
    if (!success) throw new Error("Xóa bài hát khỏi album thất bại");
    return { message: "Đã xóa bài hát khỏi album" };
  },
};

module.exports = AlbumSongService;