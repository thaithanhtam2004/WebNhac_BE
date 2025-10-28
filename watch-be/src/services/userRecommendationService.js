const UserRecommendationRepository = require("../infras/repositories/userRecommendationRepository");
const SongRepository = require("../infras/repositories/songRepository");
const { runPythonScript } = require("../utils/pythonRunner");

const UserRecommendationService = {
  // Lấy gợi ý cơ bản (chỉ songId, score, generatedAt)
  async getRecommendationsByUser(userId, limit = 20) {
    const recommendations = await UserRecommendationRepository.getRecommendationsByUser(userId, limit);
    if (!recommendations.length) return [];
    return recommendations;
  },

  // Lấy gợi ý + thông tin chi tiết bài hát
  async getRecommendationsWithSongDetail(userId, limit = 20) {
    const recommendations = await UserRecommendationRepository.getRecommendationsByUser(userId, limit);
    if (!recommendations.length) return [];

    const songIds = recommendations.map(r => r.songId);
    const sql = `
      SELECT 
        s.songId,
        s.title,
        s.duration,
        s.coverUrl,
        s.fileUrl,
        s.lyric,
        s.views,
        s.releaseDate,
        s.popularityScore,
        si.singerId,
        si.name AS singerName,
        g.genreId,
        g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.songId IN (?)
    `;
    const [songDetails] = await require("../infras/db/connection").promise().query(sql, [songIds]);

    return recommendations.map(rec => {
      const song = songDetails.find(s => s.songId === rec.songId) || null;
      return { ...rec, song };
    });
  },

  // CRUD các gợi ý
  async addOrUpdateRecommendation(userId, songId, score, generatedAt) {
    const success = await UserRecommendationRepository.addOrUpdateRecommendation(userId, songId, score, generatedAt);
    if (!success) throw new Error("Thêm hoặc cập nhật gợi ý thất bại");
    return { message: "Thêm hoặc cập nhật gợi ý thành công" };
  },

  async addMultipleRecommendations(recommendations = []) {
    if (!recommendations.length) throw new Error("Danh sách gợi ý rỗng");
    const success = await UserRecommendationRepository.addMultipleRecommendations(recommendations);
    if (!success) throw new Error("Thêm nhiều gợi ý thất bại");
    return { message: "Thêm nhiều gợi ý thành công" };
  },

  async removeRecommendation(userId, songId) {
    const success = await UserRecommendationRepository.removeRecommendation(userId, songId);
    if (!success) throw new Error("Xóa gợi ý thất bại (có thể gợi ý không tồn tại)");
    return { message: "Đã xóa gợi ý thành công" };
  },

  async updateUserRecommendations(userId, recommendations = []) {
    const success = await UserRecommendationRepository.updateUserRecommendations(userId, recommendations);
    if (!success) throw new Error("Cập nhật gợi ý cho user thất bại");
    return { message: "Cập nhật gợi ý cho user thành công" };
  },

  // 🔹 Generate gợi ý cho tất cả user bằng Python script
  async generateAllRecommendations() {
    try {
      // Giả sử Python script nằm ở "python/recommendation.py"
      // Truyền flag --mode batch để tính cho tất cả user
      const recommendations = await runPythonScript("python/recommendation.py", ["--mode", "batch"]);
      console.log("✅ Python batch recommendations generated:", recommendations.length);
      return { message: "Generate recommendation cho tất cả user thành công", data: recommendations };
    } catch (error) {
      console.error("❌ Failed to generate recommendations:", error.message);
      throw new Error("Generate recommendation thất bại");
    }
  }
};

module.exports = UserRecommendationService;
