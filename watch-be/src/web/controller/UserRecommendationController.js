const UserRecommendationService = require("../../services/userRecommendationService");

const UserRecommendationController = {
  // ✅ Lấy gợi ý + info bài hát
  async getWithSongDetail(req, res) {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit) || 20;

      const data = await UserRecommendationService.getRecommendationsWithSongDetail(userId, limit);

      return res.json({
        success: true,
        userId,
        total: data.length,
        data
      });

    } catch (error) {
      console.error("❌ Lỗi getWithSongDetail:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // ✅ Generate recommendation với Python
  async generate(req, res) {
    try {
      const pythonResult = await UserRecommendationService.generateAllRecommendations();

      // Lưu vào DB
      await UserRecommendationService.addMultipleRecommendations(pythonResult.data);

      return res.json({
        success: true,
        message: "Tạo gợi ý bằng Python thành công & đã lưu vào DB",
        total: pythonResult.data.length
      });

    } catch (error) {
      console.error("❌ generate error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = UserRecommendationController;
