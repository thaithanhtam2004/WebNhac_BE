const pool = require("../db/connection").promise();

const SingerRepository = {
  async findAll() {
    const sql = `SELECT singerId, name, bio, imageUrl FROM Singer ORDER BY name ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(singerId) {
    const sql = `SELECT * FROM Singer WHERE singerId = ?`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows[0] || null;
  },

  async create(singer) {
    const sql = `INSERT INTO Singer (singerId, name, bio, imageUrl) VALUES (?, ?, ?, ?)`;
    const values = [singer.singerId, singer.name, singer.bio, singer.imageUrl];

    //await pool.query(sql, values);
    return singer.singerId;
  },

  async update(singerId, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.bio !== undefined) {
      fields.push("bio = ?");
      values.push(data.bio);
    }
    if (data.imageUrl !== undefined) {
      fields.push("imageUrl = ?");
      values.push(data.imageUrl);
    }

    if (fields.length === 0) return false;

    const sql = `UPDATE Singer SET ${fields.join(", ")} WHERE singerId = ?`;
    values.push(singerId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async delete(singerId) {
    const sql = `DELETE FROM Singer WHERE singerId = ?`;
    const [result] = await pool.query(sql, [singerId]);
    return result.affectedRows > 0;
  },
};

module.exports = SingerRepository;
