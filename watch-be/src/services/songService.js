const { ulid } = require("ulid");
const SongRepository = require("../infras/repositories/songRepository");

const SongService = {
  // 🟢 Lấy tất cả bài hát
  async getAllSongs() {
    return await SongRepository.findAll();
  },

  // 🟢 Lấy bài hát theo ID
  async getSongById(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");
    return song;
  },

  // 🟢 Tăng lượt nghe (views)
  async increaseView(songId) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Không tìm thấy bài hát");
    await SongRepository.increaseView(songId);
    return { message: "Đã tăng lượt nghe thành công" };
  },

  // 🟢 Tạo bài hát mới (KHÔNG upload, chỉ lưu data)
  async createSong(data) {
    const songId = ulid();

    await SongRepository.create({
      ...data,
      songId,
    });

    return { message: "Tạo bài hát thành công", songId };
  },

  // 🟢 Cập nhật bài hát (KHÔNG upload, chỉ cập nhật data)
  async updateSong(songId, data) {
    const song = await SongRepository.findById(songId);
    if (!song) throw new Error("Bài hát không tồn tại");

    const success = await SongRepository.update(songId, data);

    if (!success) throw new Error("Cập nhật thất bại");
    return { message: "Cập nhật bài hát thành công" };
  },

  // 🟢 Xóa bài hát
  async deleteSong(songId) {
    const success = await SongRepository.delete(songId);
    if (!success) throw new Error("Xóa thất bại (bài hát không tồn tại)");
    return { message: "Đã xóa bài hát thành công" };
  },
};

module.exports = SongService;