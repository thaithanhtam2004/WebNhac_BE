const { ulid } = require("ulid");
const EmotionRepository = require("../infras/repositories/emotionRepository");

const EmotionService = {
  // 🟢 Lấy tất cả cảm xúc
  async getAllEmotions() {
    return await EmotionRepository.findAll();
  },

  // 🟢 Lấy cảm xúc theo ID
  async getEmotionById(emotionId) {
    const emotion = await EmotionRepository.findById(emotionId);
    if (!emotion) throw new Error("Cảm xúc không tồn tại");
    return emotion;
  },

  // 🟢 Tạo cảm xúc mới
  async createEmotion(data) {
    if (!data.name?.trim()) throw new Error("Tên cảm xúc không được để trống");

    // Kiểm tra trùng tên
    const existing = await EmotionRepository.findByName(data.name.trim());
    if (existing) throw new Error("Tên cảm xúc đã tồn tại");

    const emotionId = ulid();
    await EmotionRepository.create({
      emotionId,
      name: data.name.trim(),
      description: data.description || null,
    });

    return { message: "Tạo cảm xúc thành công", emotionId };
  },

  // 🟢 Cập nhật cảm xúc
  async updateEmotion(emotionId, data) {
    const emotion = await EmotionRepository.findById(emotionId);
    if (!emotion) throw new Error("Cảm xúc không tồn tại");

    // Nếu cập nhật tên thì kiểm tra trùng
    if (data.name) {
      const existing = await EmotionRepository.findByName(data.name.trim());
      if (existing && existing.emotionId !== emotionId)
        throw new Error("Tên cảm xúc đã tồn tại");
    }

    const success = await EmotionRepository.update(emotionId, data);
    if (!success) throw new Error("Cập nhật cảm xúc thất bại");

    return { message: "Cập nhật cảm xúc thành công" };
  },

  // 🟢 Xóa cảm xúc
  async deleteEmotion(emotionId) {
    const emotion = await EmotionRepository.findById(emotionId);
    if (!emotion) throw new Error("Cảm xúc không tồn tại");

    const success = await EmotionRepository.delete(emotionId);
    if (!success) throw new Error("Xóa cảm xúc thất bại");

    return { message: "Đã xóa cảm xúc thành công" };
  },
};

module.exports = EmotionService;
