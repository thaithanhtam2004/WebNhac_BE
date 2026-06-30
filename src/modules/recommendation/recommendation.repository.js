const pool = require("../../config/database").promise();

const UserRecommendationRepository = {
  // 🟢 Lấy danh sách gợi ý cho user
  async getRecommendationsByUser(userId, limit = 20) {
    const sql = `
      SELECT userId, songId, score, generatedAt
      FROM UserRecommendation
      WHERE userId = ?
      ORDER BY score DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [userId, limit]);
    return rows;
  },

  // 🟢 Thêm hoặc cập nhật 1 gợi ý
  async addOrUpdateRecommendation(userId, songId, score, generatedAt = new Date()) {
    const sql = `
      INSERT INTO UserRecommendation (userId, songId, score, generatedAt)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE score = VALUES(score), generatedAt = VALUES(generatedAt)
    `;
    const [result] = await pool.query(sql, [userId, songId, score, generatedAt]);
    return result.affectedRows > 0;
  },

  // 🆕 Thêm nhiều gợi ý cùng lúc
  async addMultipleRecommendations(recommendations = []) {
    if (!recommendations.length) return false;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertSql = `
        INSERT INTO UserRecommendation (userId, songId, score, generatedAt)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE score = VALUES(score), generatedAt = VALUES(generatedAt)
      `;

      for (const rec of recommendations) {
        const { userId, songId, score, generatedAt } = rec;
        await connection.query(insertSql, [userId, songId, score, generatedAt || new Date()]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("❌ addMultipleRecommendations error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 🟢 Xóa gợi ý
  async removeRecommendation(userId, songId) {
    const sql = `DELETE FROM UserRecommendation WHERE userId = ? AND songId = ?`;
    const [result] = await pool.query(sql, [userId, songId]);
    return result.affectedRows > 0;
  },

  // 🟢 Cập nhật toàn bộ gợi ý của user (thường dùng sau khi chạy Python script)
  async updateUserRecommendations(userId, recommendations = []) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa toàn bộ gợi ý cũ
      await connection.query(`DELETE FROM UserRecommendation WHERE userId = ?`, [userId]);

      // Thêm danh sách mới
      if (recommendations.length > 0) {
        const insertSql = `
          INSERT INTO UserRecommendation (userId, songId, score, generatedAt)
          VALUES (?, ?, ?, ?)
        `;
        for (const rec of recommendations) {
          const { songId, score, generatedAt } = rec;
          await connection.query(insertSql, [userId, songId, score, generatedAt || new Date()]);
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("❌ updateUserRecommendations error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = UserRecommendationRepository;
