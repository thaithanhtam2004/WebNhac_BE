const { ulid } = require('ulid');
const PlaylistRepository = require('../infras/repositories/playlistRepository');
const PlaylistSongRepository = require('../infras/repositories/playlistSongRepository');

const PlaylistService = {
  async getPlaylistsByUser(userId) {
    return await PlaylistRepository.findByUser(userId);
  },

  async getAllPlaylists() {
    return await PlaylistRepository.findAll();
  },

  async getPlaylistById(playlistId) {
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Không tìm thấy playlist");
    return playlist;
  },

  async createPlaylist({ name, userId }) {
    const playlistId = ulid();
    await PlaylistRepository.create({ playlistId, name, userId });
    return { message: "Tạo playlist thành công", playlistId };
  },

  async updatePlaylist(playlistId, name) {
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Playlist không tồn tại");
    await PlaylistRepository.update(playlistId, name);
    return { message: "Đã cập nhật tên playlist" };
  },

  async deletePlaylist(playlistId) {
    await PlaylistRepository.delete(playlistId);
    return { message: "Xóa playlist thành công" };
  },

  async addSongToPlaylist(playlistId, songId) {
    await PlaylistSongRepository.addSong(playlistId, songId);
    return { message: "Đã thêm bài hát vào playlist" };
  },

  async removeSongFromPlaylist(playlistId, songId) {
    await PlaylistSongRepository.removeSong(playlistId, songId);
    return { message: "Đã xóa bài hát khỏi playlist" };
  },

  async getSongsOfPlaylist(playlistId) {
    return await PlaylistSongRepository.findSongsByPlaylist(playlistId);
  }
};

module.exports = PlaylistService;
