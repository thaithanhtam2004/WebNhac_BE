const HistoryService = require("../../services/historyService");

class HistoryController {

  async getUserHistory(req, res) {
    try {
      const { userId } = req.params;
      const history = await HistoryService.getHistoryByUser(userId);
      res.json({ success: true, data: history });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async addHistory(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId)
        return res.status(400).json({ success: false, message: "Thiếu userId hoặc songId" });

      const result = await HistoryService.saveHistory(userId, songId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async clearHistory(req, res) {
    try {
      const { userId } = req.params;
      const result = await HistoryService.clearHistory(userId);
      res.json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async removeSong(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId)
        return res.status(400).json({ success: false, message: "Thiếu userId hoặc songId" });

      const result = await HistoryService.removeSongFromHistory(userId, songId);
      res.json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HistoryController();
