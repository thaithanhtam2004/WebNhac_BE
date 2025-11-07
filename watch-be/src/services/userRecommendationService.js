const UserRecommendationRepository = require("../infras/repositories/userRecommendationRepository");
const { runPythonScript } = require("../utils/pythonRunner");
const path = require("path");
const scriptPath = path.join(__dirname, "..", "python", "recommendation.py");
const SongRepository = require("../infras/repositories/songRepository");
const UserRecommendationService = {
  /** Realtime generate recommendation cho 1 user */
  async generateRecommendationsForUser(userId) {
    if (!userId) throw new Error("Thiếu userId");

    // Gọi Python script realtime
const recs = await runPythonScript(scriptPath, ["--userId", userId.toString()]);

    if (!Array.isArray(recs)) throw new Error("Python return không đúng định dạng");

    // Lưu vào bảng UserRecommendation
    await UserRecommendationRepository.updateUserRecommendations(userId, recs);

    return recs; // Trả về Node.js để emit realtime
  },

   async getRecommendationsWithSongDetail(userId, limit = 20) {
  // Lấy recs từ DB
  const recs = await UserRecommendationRepository.getRecommendationsByUser(userId, limit);

  if (!Array.isArray(recs) || recs.length === 0) return [];

  // map an toàn, lọc null
  const songs = await Promise.all(
    recs.map(async (r) => {
      const song = await SongRepository.findById(r.songId);
      if (!song) return null; // bỏ qua những songId không tồn tại
      return {
        ...song,
        score: r.score,
        generatedAt: r.generatedAt,
      };
    })
  );

  return songs.filter((s) => s !== null);
}

};

module.exports = UserRecommendationService;
