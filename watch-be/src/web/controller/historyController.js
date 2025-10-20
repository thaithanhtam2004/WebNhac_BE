// src/web/controller/historyController.js
const HistoryService = require("../../services/historyService");

class HistoryController {
  async getUserHistory(req, res) {
    try {
      const { userId } = req.params;
      const history = await HistoryService.getHistoryByUser(userId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async addHistory(req, res) {
    try {
      const { userId, songId } = req.body;
      const result = await HistoryService.saveHistory(userId, songId);
      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateHistory(req, res) {
    try {
      const { id } = req.params;
      const result = await HistoryService.updateHistoryTime(id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async clearHistory(req, res) {
    try {
      const { userId } = req.params;
      const result = await HistoryService.clearHistory(userId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async removeSong(req, res) {
    try {
      const { userId, songId } = req.body;
      const result = await HistoryService.removeSongFromHistory(userId, songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HistoryController();
