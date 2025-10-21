const FavoriteService = require("../../services/favoriteService");

class FavoriteController {
  async getUserFavorites(req, res) {
    try {
      const { userId } = req.params;
      const favorites = await FavoriteService.getFavoritesByUser(userId);
      res.status(200).json({ success: true, data: favorites });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async addFavorite(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId) throw new Error("Thiếu userId hoặc songId");
      const result = await FavoriteService.addFavorite(userId, songId);
      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async removeFavorite(req, res) {
    try {
      const { userId, songId } = req.body;
      if (!userId || !songId) throw new Error("Thiếu userId hoặc songId");
      const result = await FavoriteService.removeFavorite(userId, songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new FavoriteController();
