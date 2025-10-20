const pool = require('../db/connection').promise();
const bcrypt = require('bcrypt');

const UserRepository = {
  // Tìm người dùng theo email
  async findByEmail(email) {
    const sql = 'SELECT * FROM User WHERE email = ?';
    const [rows] = await pool.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Lấy người dùng + mật khẩu (cho đăng nhập)
  async findUserWithPassword(email) {
    const sql = `
      SELECT userId, password, roleId, name
      FROM User
      WHERE email = ? AND isActive = TRUE
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Lấy tất cả người dùng
  async findAll() {
    const sql = `
      SELECT userId, name, email, phone, roleId, isActive, createdAt
      FROM User
      ORDER BY name
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Tạo tài khoản người dùng
  async create({ name, email, phone, password, roleId = 2 }) {
    const passwordHash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO User (name, email, phone, password, roleId)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      name,
      email,
      phone,
      passwordHash,
      roleId
    ]);

    return {
      userId: result.insertId,
      name,
      email,
      phone,
      roleId
    };
  },

  // Lấy người dùng theo ID
  async findById(userId) {
    const sql = 'SELECT * FROM User WHERE userId = ?';
    const [rows] = await pool.query(sql, [userId]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Cập nhật thông tin người dùng
  async update(userId, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return false;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE User SET ${setClause} WHERE userId = ?`;

    const [result] = await pool.query(sql, [...values, userId]);
    return result.affectedRows > 0;
  },

  // Đổi mật khẩu
  async changePassword(userId, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE User SET password = ? WHERE userId = ?';
    const [result] = await pool.query(sql, [hash, userId]);
    return result.affectedRows > 0;
  },

  // Xóa (hoặc vô hiệu hóa) người dùng
  async delete(userId, { softDelete = true } = {}) {
    if (softDelete) {
      const sql = 'UPDATE User SET isActive = FALSE WHERE userId = ?';
      const [result] = await pool.query(sql, [userId]);
      return result.affectedRows > 0;
    } else {
      const sql = 'DELETE FROM User WHERE userId = ?';
      const [result] = await pool.query(sql, [userId]);
      return result.affectedRows > 0;
    }
  }
};

module.exports = UserRepository;
