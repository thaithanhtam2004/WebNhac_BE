const pool = require("../db/connection").promise();

const EmotionRepository = {
  // 🟢 Lấy tất cả cảm xúc
  async findAll() {
    const sql = `
      SELECT 
        emotionId,
        name,
        description,
        createdAt
      FROM Emotion
      ORDER BY createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy cảm xúc theo ID
  async findById(emotionId) {
    const sql = `
      SELECT 
        emotionId,
        name,
        description,
        createdAt
      FROM Emotion
      WHERE emotionId = ?
    `;
    const [rows] = await pool.query(sql, [emotionId]);
    return rows[0] || null;
  },

  // 🟢 Lấy cảm xúc theo tên
  async findByName(name) {
    const sql = `
      SELECT 
        emotionId,
        name,
        description,
        createdAt
      FROM Emotion
      WHERE name = ?
    `;
    const [rows] = await pool.query(sql, [name]);
    return rows[0] || null;
  },

  // 🟢 Tạo cảm xúc mới
  async create(emotion) {
    const sql = `
      INSERT INTO Emotion (emotionId, name, description, createdAt)
      VALUES (?, ?, ?, NOW())
    `;
    const values = [
      emotion.emotionId,
      emotion.name,
      emotion.description || null,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🟢 Cập nhật cảm xúc
  async update(emotionId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }

    if (fields.length === 0) return false;

    const sql = `UPDATE Emotion SET ${fields.join(", ")} WHERE emotionId = ?`;
    values.push(emotionId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🟢 Xóa cảm xúc
  async delete(emotionId) {
    const sql = `DELETE FROM Emotion WHERE emotionId = ?`;
    const [result] = await pool.query(sql, [emotionId]);
    return result.affectedRows > 0;
  },
};

module.exports = EmotionRepository;
