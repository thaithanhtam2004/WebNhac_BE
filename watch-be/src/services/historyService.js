const HistoryRepository = require("../infras/repositories/historyRepository");

const HistoryService = {
  // Lưu lịch sử nghe — nếu nghe rồi thì tăng count
  async saveHistory(userId, songId) {
    const existing = await HistoryRepository.findOne(userId, songId);

    if (existing) {
      await HistoryRepository.updateListen(userId, songId);
      return { message: "Đã cập nhật lịch sử nghe" };
    } else {
      await HistoryRepository.addFirstTime(userId, songId);
      return { message: "Đã thêm bài hát vào lịch sử lần đầu" };
    }
  },

  async getHistoryByUser(userId) {
    return await HistoryRepository.findByUser(userId);
  },

  async clearHistory(userId) {
    await HistoryRepository.clear(userId);
    return { message: "Đã xóa toàn bộ lịch sử nghe" };
  },

  async removeSongFromHistory(userId, songId) {
    await HistoryRepository.removeSong(userId, songId);
    return { message: "Đã xóa bài khỏi lịch sử" };
  }
};

module.exports = HistoryService;
