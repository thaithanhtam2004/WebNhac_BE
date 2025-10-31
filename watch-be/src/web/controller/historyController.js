// src/web/controller/historyController.js
const HistoryService = require("../../services/historyService");

class HistoryController {
  // 🟢 Lấy lịch sử nghe của user
  async getUserHistory(req, res) {
    try {
      const { userId } = req.params;
      const history = await HistoryService.getHistoryByUser(userId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Thêm bài hát vào lịch sử (hoặc update lastPlayed nếu đã tồn tại)
  async addHistory(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu userId hoặc songId" });
      }

      const result = await HistoryService.saveHistory(userId, songId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Cập nhật thời gian nghe (nếu cần riêng endpoint)
  async updateHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await HistoryService.updateHistoryTime(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Xóa toàn bộ lịch sử nghe của user
  async clearHistory(req, res) {
    try {
      const { userId } = req.params;
      const result = await HistoryService.clearHistory(userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 Xóa 1 bài hát khỏi lịch sử nghe
  async removeSong(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId) {
        return res
          .status(400)
          .json({ success: false, message: "Thiếu userId hoặc songId" });
      }

      const result = await HistoryService.removeSongFromHistory(userId, songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HistoryController();
