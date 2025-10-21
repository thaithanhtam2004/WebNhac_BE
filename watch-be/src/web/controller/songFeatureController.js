const SongFeatureService = require("../../services/songFeatureService");

const SongFeatureController = {
  async analyze(req, res) {
     console.log("✅ Đã nhận request POST /api/features/analyze");
  console.log("Body nhận được:", req.body);
    try {
      const { songId, filePath } = req.body;
      if (!songId || !filePath)
        return res.status(400).json({ error: "Thiếu songId hoặc filePath" });

      const result = await SongFeatureService.analyzeAndSave(songId, filePath);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBySongId(req, res) {
    try {
      const { songId } = req.params;
      const feature = await SongFeatureService.getFeatureBySong(songId);
      res.json(feature);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },
};

module.exports = SongFeatureController;
