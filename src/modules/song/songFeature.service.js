const path = require("path");
const fs = require("fs");
const { runPythonScript } = require("../../utils/pythonRunner");
const SongFeatureRepository = require("./songFeature.repository");
const EmotionRepository = require("../emotion/emotion.repository");

const SongFeatureService = {
  async analyzeAndSave(songId, filePath, emotionId = null) {
    if (!songId || !filePath) throw new Error("Thiếu songId hoặc filePath");
    if (!fs.existsSync(filePath)) throw new Error("File audio không tồn tại");

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

    // Lưu vào DB
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

  async predictEmotion(songId, filePath) {
  if (!songId || !filePath) throw new Error("Thiếu songId hoặc filePath");
  if (!fs.existsSync(filePath)) throw new Error("File audio không tồn tại");

  const scriptPath = path.join(__dirname, "../python/featureClassify.py");
  if (!fs.existsSync(scriptPath)) throw new Error("File Python script không tồn tại");

  try {
    const result = await runPythonScript(scriptPath, [filePath]);
    if (result.error) throw new Error(result.error);

    // Lấy emotionId từ tên cảm xúc
    const emotionRecord = await EmotionRepository.findByName(result.emotion);
    const emotionId = emotionRecord ? emotionRecord.emotionId : null;

    if (!emotionId) {
      console.warn(`Không tìm thấy emotionId cho tên: "${result.emotion}"`);
      return { message: "Không tìm thấy emotion trong DB", emotion: result.emotion };
    }

    // 🔹 Tạo mới bản ghi nếu chưa có
    const featureRecord = await SongFeatureRepository.findBySongId(songId);
    if (featureRecord) {
      // Update nếu đã có
      await SongFeatureRepository.updateEmotionBySong(songId, emotionId);
    } else {
      // Tạo mới nếu chưa có
      await SongFeatureRepository.create({
        songId,
        features: result.features,
        emotionId,
      });
    }

    return {
      message: "Dự đoán cảm xúc bài hát thành công",
      emotion: result.emotion,
      emotionId,
      features: result.features,
    };
  } catch (err) {
    console.error("Lỗi khi dự đoán cảm xúc:", err.message);
    throw new Error("Không thể dự đoán cảm xúc bài hát");
  }
}

};

module.exports = SongFeatureService;
