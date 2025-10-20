const pool = require("../db/connection").promise();

const FavoriteRepository = {
  // ➕ Thêm bài hát vào yêu thích
  async add(userId, songId) {
    const sql = `INSERT IGNORE INTO Favorite (userId, songId) VALUES (?, ?)`;
    await pool.query(sql, [userId, songId]);
  },

  // ❌ Bỏ yêu thích
  async remove(userId, songId) {
    const sql = `DELETE FROM Favorite WHERE userId = ? AND songId = ?`;
    await pool.query(sql, [userId, songId]);
  },

  // 📋 Lấy danh sách bài hát yêu thích của user
  async findByUser(userId) {
    const sql = `
      SELECT s.*
      FROM Song s
      JOIN Favorite f ON s.songId = f.songId
      WHERE f.userId = ?
      ORDER BY f.createdAt DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  },

  // ✅ Kiểm tra xem bài hát đã được yêu thích chưa
  async exists(userId, songId) {
    const sql = `SELECT * FROM Favorite WHERE userId = ? AND songId = ?`;
    const [rows] = await pool.query(sql, [userId, songId]);
    return rows.length > 0;
  },
};

module.exports = FavoriteRepository;
