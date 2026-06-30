const fs = require("fs");
const path = require("path");
const SongFeatureService = require("./songFeature.service");

const SongFeatureController = {
  // 🧠 Phân tích cảm xúc bài hát
  async analyze(req, res) {
    console.log("✅ Đã nhận request POST /api/features/analyze");

    try {
      const { songId, emotionId } = req.body;
      const file = req.file; // lấy file từ multer

      // ✅ Kiểm tra đầu vào
      if (!songId) return res.status(400).json({ error: "Thiếu songId" });
      if (!file) return res.status(400).json({ error: "Thiếu file nhạc" });

      // 🟢 Tạo thư mục lưu file tạm
      const uploadDir = path.join(__dirname, "../../uploads/audio");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // 🟢 Lưu file vào ổ cứng tạm thời
      const filePath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      console.log("📂 Đã lưu file tạm tại:", filePath);

      // 🧠 Gọi service xử lý phân tích
      const result = await SongFeatureService.analyzeAndSave(songId, filePath, emotionId);

      // 🧹 (Tùy chọn) Xóa file sau khi xử lý xong để tránh rác
      fs.unlink(filePath, (err) => {
        if (err) console.error("⚠️ Không thể xóa file tạm:", err.message);
      });

      return res.json({
        success: true,
        message: "Phân tích cảm xúc bài hát thành công!",
        data: result,
      });
    } catch (error) {
      console.error("❌ Lỗi trong analyze:", error);
      return res.status(500).json({ error: error.message });
    }
  },

  // 🧠 Lấy đặc trưng bài hát
  async getBySongId(req, res) {
    try {
      const { songId } = req.params;
      const feature = await SongFeatureService.getFeatureBySong(songId);
      res.json({ success: true, data: feature });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },


   async predictEmotion(req, res) {
    console.log("✅ Đã nhận request POST /api/features/predict-emotion");

    try {
      const { songId } = req.body;
      const file = req.file;

      if (!songId) return res.status(400).json({ error: "Thiếu songId" });
      if (!file) return res.status(400).json({ error: "Thiếu file nhạc" });

      const uploadDir = path.join(__dirname, "../../uploads/audio");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(filePath, file.buffer);
      console.log("📂 Đã lưu file tạm tại:", filePath);

      // 🧠 Gọi hàm predictEmotion trong service
      const result = await SongFeatureService.predictEmotion(songId, filePath);

      // Xóa file tạm sau khi xử lý
      fs.unlink(filePath, (err) => {
        if (err) console.error("⚠️ Không thể xóa file tạm:", err.message);
      });

      return res.json({
        success: true,
        message: "Dự đoán cảm xúc bài hát thành công!",
        data: result,
      });
    } catch (error) {
      console.error("❌ Lỗi trong predictEmotion:", error);
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = SongFeatureController;
