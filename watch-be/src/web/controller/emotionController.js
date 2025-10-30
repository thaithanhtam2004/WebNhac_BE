const EmotionService = require("../../services/emotionService");

class EmotionController {
  // 🟩 Lấy tất cả cảm xúc
  async getAll(req, res) {
    try {
      const emotions = await EmotionService.getAllEmotions();
      res.status(200).json({ success: true, data: emotions });
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách cảm xúc:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách cảm xúc",
        error: err.message,
      });
    }
  }

  // 🟩 Lấy cảm xúc theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const emotion = await EmotionService.getEmotionById(id);

      if (!emotion) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cảm xúc",
        });
      }

      res.status(200).json({ success: true, data: emotion });
    } catch (err) {
      console.error("❌ Lỗi khi lấy cảm xúc theo ID:", err);
      res.status(500).json({
        success: false,
        message: "Không thể lấy thông tin cảm xúc",
        error: err.message,
      });
    }
  }

  // 🟩 Tạo cảm xúc mới
  async create(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tên cảm xúc",
        });
      }

      const result = await EmotionService.createEmotion(req.body);
      res.status(201).json({
        success: true,
        message: result.message,
        emotionId: result.emotionId,
      });
    } catch (err) {
      console.error("❌ Lỗi tạo cảm xúc:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Tạo cảm xúc thất bại",
      });
    }
  }

  // 🟩 Cập nhật cảm xúc
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await EmotionService.updateEmotion(id, req.body);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cảm xúc để cập nhật",
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      console.error("❌ Lỗi cập nhật cảm xúc:", err);
      res.status(400).json({
        success: false,
        message: err.message || "Cập nhật cảm xúc thất bại",
      });
    }
  }

  // 🟩 Xóa cảm xúc
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await EmotionService.deleteEmotion(id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy cảm xúc để xóa",
        });
      }

      res.status(200).json({
        success: true,
        message: "Đã xóa cảm xúc thành công",
      });
    } catch (err) {
      console.error("❌ Lỗi xóa cảm xúc:", err);
      res.status(500).json({
        success: false,
        message: err.message || "Không thể xóa cảm xúc",
      });
    }
  }
}

module.exports = new EmotionController();
