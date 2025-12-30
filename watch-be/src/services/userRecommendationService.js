const UserRecommendationRepository = require("../infras/repositories/userRecommendationRepository");
const { runPythonScript } = require("../utils/pythonRunner");
const path = require("path");
const scriptPath = path.join(__dirname, "..", "python", "recommendationV2.py");
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
    // 1. Thử lấy gợi ý từ DB (do Python tạo ra)
    let recs = await UserRecommendationRepository.getRecommendationsByUser(userId, limit);

    // 2. KIỂM TRA: Nếu không có gợi ý (User mới hoặc Python chưa chạy)
    if (!Array.isArray(recs) || recs.length === 0) {
      console.log(`[Fallback] User ${userId} chưa có gợi ý, đang lấy nhạc ngẫu nhiên...`);
      
      // Gọi hàm findRandom vừa thêm ở Bước 1
      const randomSongs = await SongRepository.findRandom(10); 
      
      // Trả về luôn danh sách nhạc ngẫu nhiên
      return randomSongs.map(s => ({
        ...s,
        score: 0,
        isFallback: true 
      }));
    }

    // 3. Nếu ĐÃ CÓ gợi ý thì chạy tiếp logic cũ của bạn
    const songs = await Promise.all(
      recs.map(async (r) => {
        const song = await SongRepository.findById(r.songId);
        if (!song) return null;
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
