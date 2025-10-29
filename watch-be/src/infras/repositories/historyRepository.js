// src/infras/repositories/historyRepository.js
const pool = require("../db/connection").promise();

const HistoryRepository = {
  // ➕ Lưu lịch sử nghe nhạc
  async add({ historyId, userId, songId }) {
    const sql = `INSERT INTO History (historyId, userId, songId) VALUES (?, ?, ?)`;
    await pool.query(sql, [historyId, userId, songId]);
  },

  // 📋 Lấy lịch sử nghe của người dùng
  async findByUser(userId) {
    const sql = `
      SELECT h.*, s.title, s.coverUrl, s.singerId
      FROM History h
      JOIN Song s ON h.songId = s.songId
      WHERE h.userId = ?
      ORDER BY h.listenedAt DESC
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  },

  // ✏️ Cập nhật thời gian nghe
  async updateListenedAt(historyId) {
    const sql = `UPDATE History SET listenedAt = CURRENT_TIMESTAMP WHERE historyId = ?`;
    await pool.query(sql, [historyId]);
  },

  // ❌ Xóa toàn bộ lịch sử
  async clear(userId) {
    const sql = `DELETE FROM History WHERE userId = ?`;
    await pool.query(sql, [userId]);
  },

  // ❌ Xóa 1 bài cụ thể
  async removeSong(userId, songId) {
    const sql = `DELETE FROM History WHERE userId = ? AND songId = ?`;
    await pool.query(sql, [userId, songId]);
  },
};

module.exports = HistoryRepository;
