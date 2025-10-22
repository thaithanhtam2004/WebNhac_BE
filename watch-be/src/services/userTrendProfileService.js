const UserTrendProfileRepository = require("../infras/repositories/userTrendProfileRepository");

const UserTrendProfileService = {
  /**
   * Tạo hoặc cập nhật profile dựa trên dữ liệu từ request
   * @param {Object} data - { userId, singerId, emotionLabel, listenCount, likeCount, emotionWeight, likeWeight, singerWeight }
   */
  async upsertProfile(data) {
    const { userId, singerId, emotionLabel, listenCount, likeCount, emotionWeight, likeWeight, singerWeight } = data;

    // Validate dữ liệu
    if (!userId) throw new Error("Thiếu userId");
    if (!singerId) throw new Error("Thiếu singerId");
    if (!emotionLabel) throw new Error("Thiếu emotionLabel");

    // Chuẩn bị dữ liệu để upsert
    const profile = {
      userId,
      singerId,
      emotionLabel,
      listenCount: listenCount || 0,
      likeCount: likeCount || 0,
      emotionWeight: emotionWeight || 0.0,
      likeWeight: likeWeight || 0.0,
      singerWeight: singerWeight || 0.0
    };

    // Gọi repository
    const success = await UserTrendProfileRepository.upsertProfile(profile);
    if (!success) throw new Error("Tạo hoặc cập nhật profile thất bại");

    return {
      message: "Đã tạo hoặc cập nhật profile thành công",
      profile
    };
  },

  /**
   * Cập nhật trọng số cho profile dựa trên dữ liệu từ request
   * @param {Object} data - { userId, singerId, emotionLabel, emotionWeight, likeWeight, singerWeight }
   */
  async updateWeights(data) {
    const { userId, singerId, emotionLabel, emotionWeight, likeWeight, singerWeight } = data;

    if (!userId) throw new Error("Thiếu userId");
    if (!singerId) throw new Error("Thiếu singerId");
    if (!emotionLabel) throw new Error("Thiếu emotionLabel");

    // Chỉ cập nhật các trọng số được truyền
    const weights = {};
    if (emotionWeight !== undefined) weights.emotionWeight = emotionWeight;
    if (likeWeight !== undefined) weights.likeWeight = likeWeight;
    if (singerWeight !== undefined) weights.singerWeight = singerWeight;

    if (Object.keys(weights).length === 0) throw new Error("Cần cung cấp ít nhất một trọng số để cập nhật");

    const success = await UserTrendProfileRepository.updateWeights(userId, singerId, emotionLabel, weights);
    if (!success) throw new Error("Cập nhật trọng số thất bại");

    return {
      message: "Đã cập nhật trọng số thành công",
      weights
    };
  }
};

module.exports = UserTrendProfileService;