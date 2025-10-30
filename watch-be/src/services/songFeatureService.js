const path = require("path");
const fs = require("fs");
const { runPythonScript } = require("../utils/pythonRunner");
const SongFeatureRepository = require("../infras/repositories/songFeatureRepository");
const SongRepository = require("../infras/repositories/songRepository");
const SongFeatureService = {
  async analyzeAndSave(songId, filePath, emotionId = null) {
    // Validate
    if (!songId || !filePath) throw new Error("Thiếu songId hoặc filePath");
    if (!fs.existsSync(filePath)) throw new Error("File audio không tồn tại");

    // Đường dẫn tuyệt đối đến Python script
    const scriptPath = path.join(__dirname, "../python/feature.py");
    if (!fs.existsSync(scriptPath)) throw new Error("File Python script không tồn tại");

    let features;
    try {
      features = await runPythonScript(scriptPath, [filePath]);
      if (features.error) throw new Error(features.error);
    } catch (err) {
      console.error("Lỗi khi chạy Python:", err.message);
      throw new Error("Không thể trích xuất đặc trưng âm thanh");
    }

    // Lưu vào DB (gọi theo object mới)
    const newFeature = await SongFeatureRepository.create({
      songId,
      features,
      emotionId
    });

    return {
      message: "Phân tích và lưu đặc trưng bài hát thành công",
      feature: newFeature,
    };
  },

    async getAllSongsWithFeature() {
    return await SongRepository.findAllWithFeature();
  },

  async getFeatureBySong(songId) {
    const feature = await SongFeatureRepository.findBySongId(songId);
    if (!feature) throw new Error("Không tìm thấy đặc trưng cho bài hát này");
    return feature;
  },
};

module.exports = SongFeatureService;
