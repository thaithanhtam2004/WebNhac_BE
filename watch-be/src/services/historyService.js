// src/services/historyService.js
const HistoryRepository = require("../infras/repositories/historyRepository");

const HistoryService = {
  // 🟢 Lưu bài hát vào lịch sử nghe
  // Nếu đã tồn tại => update lastPlayed
  async saveHistory(userId, songId) {
    // Kiểm tra xem bài hát đã có trong lịch sử chưa
    const existing = await HistoryRepository.findByUserAndSong(userId, songId);
    if (existing) {
      await HistoryRepository.updateListenedAt(existing.historyId);
      return {
        message: "Đã cập nhật thời gian nghe",
        historyId: existing.historyId,
      };
    } else {
      const historyId = `his_${Date.now()}`; // Hoặc dùng ULID
      await HistoryRepository.add({ historyId, userId, songId });
      return { message: "Đã lưu lịch sử nghe", historyId };
    }
  },

  // 🟢 Lấy lịch sử nghe của user
  async getHistoryByUser(userId) {
    return await HistoryRepository.findByUser(userId);
  },

  // 🟢 Cập nhật thời gian nghe
  async updateHistoryTime(historyId) {
    await HistoryRepository.updateListenedAt(historyId);
    return { message: "Đã cập nhật thời gian nghe" };
  },

  // 🟢 Xóa toàn bộ lịch sử nghe của user
  async clearHistory(userId) {
    await HistoryRepository.clear(userId);
    return { message: "Đã xóa toàn bộ lịch sử nghe" };
  },

  // 🟢 Xóa 1 bài hát khỏi lịch sử
  async removeSongFromHistory(userId, songId) {
    await HistoryRepository.removeSong(userId, songId);
    return { message: "Đã xóa bài hát khỏi lịch sử nghe" };
  },
};

module.exports = HistoryService;
