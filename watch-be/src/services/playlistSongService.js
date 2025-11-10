const { ulid } = require("ulid");
const PlaylistRepository = require("../infras/repositories/playlistRepository");
const PlaylistSongRepository = require("../infras/repositories/playlistsongRepository");
const UserRepository = require("../infras/repositories/userRepository");
const SongRepository = require("../infras/repositories/songRepository");

const PlaylistService = {
  // 🟢 Lấy tất cả playlist
  async getAllPlaylists() {
    return await PlaylistRepository.findAll();
  },

  // 🟢 Lấy chi tiết playlist kèm bài hát
  async getPlaylistById(playlistId) {
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Playlist không tồn tại");

    const songs = await PlaylistSongRepository.findSongsByPlaylist(playlistId);
    return { ...playlist, songs };
  },

  // 🟢 Lấy playlist theo user
  async getPlaylistsByUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    return await PlaylistRepository.findByUserId(userId);
  },

  // 🟢 Tạo playlist mới
  async createPlaylist(data) {
    if (!data.name?.trim()) throw new Error("Tên playlist không được để trống");

    const user = await UserRepository.findById(data.userId);
    if (!user) throw new Error("Người dùng không tồn tại");

    const playlistId = ulid();
    await PlaylistRepository.create({
      playlistId,
      name: data.name.trim(),
      userId: data.userId,
    });

    return { message: "Tạo playlist thành công", playlistId };
  },

  // 🟢 Cập nhật playlist
  async updatePlaylist(playlistId, data) {
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Playlist không tồn tại");

    if (data.userId) {
      const user = await UserRepository.findById(data.userId);
      if (!user) throw new Error("Người dùng không tồn tại");
    }

    const success = await PlaylistRepository.update(playlistId, data);
    if (!success) throw new Error("Cập nhật playlist thất bại");

    return { message: "Cập nhật playlist thành công" };
  },

  // 🟢 Xóa playlist (và xóa tất cả bài hát liên kết)
  async deletePlaylist(playlistId) {
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Playlist không tồn tại");

    // Xóa tất cả bài hát liên kết
    const songs = await PlaylistSongRepository.findSongsByPlaylist(playlistId);
    for (const song of songs) {
      await PlaylistSongRepository.removeSong(playlistId, song.songId);
    }

    const success = await PlaylistRepository.delete(playlistId);
    if (!success) throw new Error("Xóa playlist thất bại");

    return { message: "Đã xóa playlist thành công" };
  },

  // 🟢 Thêm bài hát vào playlist
  async addSongToPlaylist(playlistId, songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");

    await PlaylistSongRepository.addSong(playlistId, songId);
    return { message: "Thêm bài hát thành công vào playlist" };
  },

  // 🟢 Xóa bài hát khỏi playlist
  async removeSongFromPlaylist(playlistId, songId) {
    await PlaylistSongRepository.removeSong(playlistId, songId);
    return { message: "Xóa bài hát khỏi playlist thành công" };
  },
};

module.exports = PlaylistService;
