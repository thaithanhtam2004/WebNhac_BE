const pool = require("../db/connection").promise();

const EmotionRepository = {
  async findAll() {
    const sql = `SELECT emotionId, name, description, createdAt FROM Emotion ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(emotionId) {
    const sql = `SELECT emotionId, name, description, createdAt FROM Emotion WHERE emotionId = ?`;
    const [rows] = await pool.query(sql, [emotionId]);
    return rows[0] || null;
  },

  async findByName(name) {
    // 🔹 Chuẩn hóa tên trước khi query
    const emotionName = name?.trim().toLowerCase();
    const sql = `SELECT emotionId, name, description, createdAt FROM Emotion WHERE LOWER(TRIM(name)) = ?`;
    const [rows] = await pool.query(sql, [emotionName]);
    return rows[0] || null;
  },

  async create(emotion) {
    const sql = `INSERT INTO Emotion (emotionId, name, description, createdAt) VALUES (?, ?, ?, NOW())`;
    const values = [emotion.emotionId, emotion.name, emotion.description || null];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

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

  async delete(emotionId) {
    const sql = `DELETE FROM Emotion WHERE emotionId = ?`;
    const [result] = await pool.query(sql, [emotionId]);
    return result.affectedRows > 0;
  },
};

module.exports = EmotionRepository;
