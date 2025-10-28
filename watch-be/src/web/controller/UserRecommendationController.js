const UserRecommendationService = require("../../services/userRecommendationService");

const UserRecommendationController = {
  // 🔹 Lấy gợi ý + thông tin bài hát chi tiết
  async getWithSongDetail(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      // 1️⃣ Lấy danh sách gợi ý cơ bản
      const recommendations = await UserRecommendationService.getRecommendationsByUser(userId, limit);
      if (!recommendations.length) {
        return res.json({ data: [] });
      }

      // 2️⃣ Lấy chi tiết bài hát kèm Singer + Genre
      const detailedRecommendations = await UserRecommendationService.getRecommendationsWithSongDetail(userId, limit);

      // 3️⃣ Trả về kết quả
      res.json({ data: detailedRecommendations });

    } catch (error) {
      console.error("❌ Lỗi getWithSongDetail:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = UserRecommendationController;
