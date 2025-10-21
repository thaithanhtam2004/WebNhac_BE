const UserTrendProfileService = require("../../services/userTrendProfileService");

const UserTrendProfileController = {
  // Tạo hoặc cập nhật profile
  async upsert(req, res) {
    console.log("✅ Đã nhận request POST /api/user-trend-profile");
    console.log("Body nhận được:", req.body);

    try {
      const result = await UserTrendProfileService.upsertProfile(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Cập nhật trọng số
  async updateWeights(req, res) {
    console.log("✅ Đã nhận request PUT /api/user-trend-profile/weights");
    console.log("Body nhận được:", req.body);

    try {
      const result = await UserTrendProfileService.updateWeights(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = UserTrendProfileController;
