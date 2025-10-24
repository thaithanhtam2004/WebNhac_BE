const AlbumSongRepository = require("../infras/repositories/albumSongRepository");
const SongRepository = require("../infras/repositories/songRepository");
const AlbumRepository = require("../infras/repositories/albumRepository");

const AlbumSongService = {
  // 🟢 Thêm bài hát vào album
  async addSongToAlbum(albumId, songId, trackNumber = null) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const success = await AlbumSongRepository.addSongToAlbum(albumId, songId, trackNumber);
    if (!success) throw new Error("Thêm bài hát vào album thất bại");

    return { message: "Đã thêm bài hát vào album" };
  },

  // 🟢 Xóa bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    const success = await AlbumSongRepository.removeSongFromAlbum(albumId, songId);
    if (!success) throw new Error("Xóa bài hát khỏi album thất bại");
    return { message: "Đã xóa bài hát khỏi album" };
  },

  // 🟢 Lấy danh sách bài hát trong album
  async getSongsByAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return { album, songs };
  },

  // 🟢 Cập nhật danh sách bài hát trong album
  async updateAlbumSongs(albumId, songs = []) {
    if (!Array.isArray(songs)) throw new Error("Danh sách bài hát không hợp lệ");

    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const success = await AlbumSongRepository.updateAlbumSongs(albumId, songs);
    if (!success) throw new Error("Cập nhật danh sách bài hát thất bại");

    return { message: "Đã cập nhật danh sách bài hát cho album" };
  },
};

module.exports = AlbumSongService;
