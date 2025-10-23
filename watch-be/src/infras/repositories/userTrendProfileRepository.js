const pool = require("../db/connection").promise();

const UserTrendProfileRepository = {
  // ➕ Tạo hoặc cập nhật profile
  async upsertProfile({
    userId,
    singerId,
    emotionLabel,
    listenCount = 0,
    likeCount = 0,
    emotionWeight = 0.0,
    likeWeight = 0.0,
    singerWeight = 0.0,
  }) {
    const sql = `
      INSERT INTO UserTrendProfile 
        (userId, singerId, emotionLabel, listenCount, likeCount, emotionWeight, likeWeight, singerWeight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        listenCount = VALUES(listenCount),
        likeCount = VALUES(likeCount),
        emotionWeight = VALUES(emotionWeight),
        likeWeight = VALUES(likeWeight),
        singerWeight = VALUES(singerWeight),
        lastUpdated = CURRENT_TIMESTAMP
    `;
    const [result] = await pool.query(sql, [
      userId,
      singerId,
      emotionLabel,
      listenCount,
      likeCount,
      emotionWeight,
      likeWeight,
      singerWeight,
    ]);
    return result.affectedRows > 0;
  },

  // ✏️ Cập nhật trọng số của profile
  async updateWeights(
    userId,
    singerId,
    emotionLabel,
    { emotionWeight, likeWeight, singerWeight }
  ) {
    const fields = [];
    const values = [];

    if (emotionWeight !== undefined) {
      fields.push("emotionWeight = ?");
      values.push(emotionWeight);
    }
    if (likeWeight !== undefined) {
      fields.push("likeWeight = ?");
      values.push(likeWeight);
    }
    if (singerWeight !== undefined) {
      fields.push("singerWeight = ?");
      values.push(singerWeight);
    }

    if (fields.length === 0) return false;

    const sql = `
      UPDATE UserTrendProfile
      SET ${fields.join(", ")}, lastUpdated = CURRENT_TIMESTAMP
      WHERE userId = ? AND singerId = ? AND emotionLabel = ?
    `;
    values.push(userId, singerId, emotionLabel);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },
};

module.exports = UserTrendProfileRepository;
