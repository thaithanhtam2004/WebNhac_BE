const AlbumSongRepository = require("../repositories/albumSongRepository");
const SongRepository = require("../repositories/songRepository");
const AlbumRepository = require("../repositories/albumRepository");

const AlbumSongService = {
  async addSongToAlbum(albumId, songId, trackNumber) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");

    const success = await AlbumSongRepository.addSongToAlbum(albumId, songId, trackNumber);
    if (!success) throw new Error("Thêm bài hát vào album thất bại");

    return { message: "Đã thêm bài hát vào album" };
  },

  async removeSongFromAlbum(albumId, songId) {
    const success = await AlbumSongRepository.removeSongFromAlbum(albumId, songId);
    if (!success) throw new Error("Xóa bài hát khỏi album thất bại");

    return { message: "Đã xóa bài hát khỏi album" };
  },

  async getSongsByAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return songs;
  },

  async updateAlbumSongs(albumId, songs) {
    // songs = [{ songId, trackNumber }, ...]
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Không tìm thấy album");

    const success = await AlbumSongRepository.updateAlbumSongs(albumId, songs);
    if (!success) throw new Error("Cập nhật danh sách bài hát thất bại");

    return { message: "Đã cập nhật danh sách bài hát cho album" };
  },
};

module.exports = AlbumSongService;
