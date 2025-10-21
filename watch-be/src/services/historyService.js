// src/services/historyService.js
const HistoryRepository = require("../infras/repositories/historyRepository");

const HistoryService = {
  async saveHistory(user_id, song_id) {
    const historyId = `his_${Date.now()}`; // có thể dùng ULID thay cho Date.now()
    await HistoryRepository.add({ historyId, userId: user_id, songId: song_id });
    return { message: "Đã lưu lịch sử nghe" };
  },

  async getHistoryByUser(user_id) {
    return await HistoryRepository.findByUser(user_id);
  },

  async updateHistoryTime(history_id) {
    await HistoryRepository.updateListenedAt(history_id);
    return { message: "Đã cập nhật thời gian nghe" };
  },

  async clearHistory(user_id) {
    await HistoryRepository.clear(user_id);
    return { message: "Đã xóa toàn bộ lịch sử nghe" };
  },

  async removeSongFromHistory(user_id, song_id) {
    await HistoryRepository.removeSong(user_id, song_id);
    return { message: "Đã xóa bài hát khỏi lịch sử nghe" };
  }
};

module.exports = HistoryService;
