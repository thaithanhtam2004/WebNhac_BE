// singerRepository.js
const pool = require("../db/connection").promise();

const SingerRepository = {
  /**
   * Lấy tất cả nghệ sĩ
   */
  async findAll() {
    const sql = `SELECT singerId, name, bio, imageUrl FROM Singer ORDER BY name ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  /**
   * Tìm nghệ sĩ theo ID
   */
  async findById(singerId) {
    const sql = `SELECT singerId, name, bio, imageUrl FROM Singer WHERE singerId = ?`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows[0] || null;
  },

  /**
   * Kiểm tra nghệ sĩ có tồn tại không
   */
  async exists(singerId) {
    const sql = `SELECT COUNT(*) as count FROM Singer WHERE singerId = ?`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows[0].count > 0;
  },

  /**
   * Tạo nghệ sĩ mới
   */
  async create(singer) {
    const sql = `
      INSERT INTO Singer (singerId, name, bio, imageUrl) 
      VALUES (?, ?, ?, ?)
    `;
    const values = [
      singer.singerId,
      singer.name,
      singer.bio || "",
      singer.imageUrl || null,
    ];

    const [result] = await pool.query(sql, values);

    // ✅ Kiểm tra insert thành công
    if (result.affectedRows === 0) {
      throw new Error("Không thể thêm nghệ sĩ vào database");
    }

    return singer.singerId;
  },

  /**
   * Cập nhật thông tin nghệ sĩ
   */
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

    // Không có field nào để update
    if (fields.length === 0) {
      return false;
    }

    const sql = `UPDATE Singer SET ${fields.join(", ")} WHERE singerId = ?`;
    values.push(singerId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  /**
   * Xóa nghệ sĩ
   */
  async delete(singerId) {
    const sql = `DELETE FROM Singer WHERE singerId = ?`;
    const [result] = await pool.query(sql, [singerId]);
    return result.affectedRows > 0;
  },

  /**
   * Tìm kiếm nghệ sĩ theo tên
   */
  async searchByName(keyword) {
    const sql = `
      SELECT singerId, name, bio, imageUrl 
      FROM Singer 
      WHERE name LIKE ? 
      ORDER BY name ASC
    `;
    const [rows] = await pool.query(sql, [`%${keyword}%`]);
    return rows;
  },
};

module.exports = SingerRepository;