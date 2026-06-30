const pool = require("../../config/database").promise();

const HistoryRepository = {
  // 🔎 Kiểm tra đã từng nghe bài này chưa
  async findOne(userId, songId) {
    const sql = `SELECT * FROM History WHERE userId = ? AND songId = ? LIMIT 1`;
    const [rows] = await pool.query(sql, [userId, songId]);
    return rows[0];
  },

  // ➕ Insert lịch sử (lần nghe đầu tiên)
async addFirstTime(userId, songId) {
  console.log("Adding first time history:", { userId, songId });

  try {
    // Dùng INSERT ... ON DUPLICATE KEY UPDATE để tránh lỗi
    const sql = `
      INSERT INTO History (userId, songId, listenCount, firstListenedAt, lastListenedAt)
      VALUES (?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE listenCount = listenCount
    `;
    await pool.query(sql, [userId, songId]);

    console.log("First time history added successfully.");
  } catch (err) {
    console.error("Error adding first time history:", err);
  }
}
,
  // 🔁 Update lần nghe tiếp theo
  async updateListen(userId, songId) {
    const sql = `
      UPDATE History
      SET listenCount = listenCount + 1,
          lastListenedAt = CURRENT_TIMESTAMP
      WHERE userId = ? AND songId = ?
    `;
    await pool.query(sql, [userId, songId]);
  },

  // 📋 Lấy lịch sử nghe
async findByUser(userId) {
  const sql = `
    SELECT 
        h.*, 
        s.title, 
        s.coverUrl, 
        s.fileUrl,                  -- thêm fileUrl
        sg.name AS singerName        -- lấy tên ca sĩ từ bảng Singer
    FROM History h
    JOIN Song s ON h.songId = s.songId
    LEFT JOIN Singer sg ON s.singerId = sg.singerId
    WHERE h.userId = ?
    ORDER BY h.lastListenedAt DESC
  `;
  const [rows] = await pool.query(sql, [userId]);
  return rows;
},



  // ❌ Xóa 1 bài
  async removeSong(userId, songId) {
    const sql = `DELETE FROM History WHERE userId = ? AND songId = ?`;
    await pool.query(sql, [userId, songId]);
  },

  // ❌ Xóa toàn bộ
  async clear(userId) {
    const sql = `DELETE FROM History WHERE userId = ?`;
    await pool.query(sql, [userId]);
  },
};

module.exports = HistoryRepository;
