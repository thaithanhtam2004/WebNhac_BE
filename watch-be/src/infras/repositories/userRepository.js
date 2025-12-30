const pool = require("../db/connection").promise();

const UserRepository = {
  // 🟢 Lấy tất cả user
  async findAll() {
    const sql = `
      SELECT u.userId, u.name, u.email, u.phone, u.roleId, u.isActive, u.createdAt, r.roleName
      FROM User u LEFT JOIN Role r ON u.roleId = r.roleId
      ORDER BY u.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Tìm user theo ID
  async findById(userId) {
    const sql = `
      SELECT u.userId, u.name, u.email, u.phone, u.roleId, u.isActive, u.createdAt, r.roleName
      FROM User u LEFT JOIN Role r ON u.roleId = r.roleId
      WHERE u.userId = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0] || null;
  },

  // 🟢 Tìm user theo email
  async findByEmail(email) {
    const sql = `SELECT * FROM User WHERE email = ?`;
    const [rows] = await pool.query(sql, [email]);
    return rows[0] || null;
  },

  async existsByEmail(email) {
    const [rows] = await pool.query(`SELECT 1 FROM User WHERE email = ? LIMIT 1`, [email]);
    return rows.length > 0;
  },

  // 🟢 Tạo user
  async create(user) {
    const sql = `
      INSERT INTO User (userId, name, email, phone, password, roleId, isActive)
      VALUES (?, ?, ?, ?, ?, ?, TRUE)
    `;
    const values = [user.userId, user.name, user.email, user.phone, user.password, user.roleId || null];
    await pool.query(sql, values);
    return user.userId;
  },

  // 🟡 Cập nhật thông tin
  async update(userId, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.phone !== undefined) { fields.push("phone = ?"); values.push(data.phone); }
    if (data.roleId !== undefined) { fields.push("roleId = ?"); values.push(data.roleId); }

    if (fields.length === 0) return false;
    values.push(userId);
    const sql = `UPDATE User SET ${fields.join(", ")} WHERE userId = ?`;
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async updatePassword(userId, hashedPassword) {
    const [result] = await pool.query(`UPDATE User SET password = ? WHERE userId = ?`, [hashedPassword, userId]);
    return result.affectedRows > 0;
  },

  // 🔴/🟢 Thay đổi trạng thái (Dùng chung cho cả khóa và mở)
  async updateStatus(userId, isActive) {
    const [result] = await pool.query(`UPDATE User SET isActive = ? WHERE userId = ?`, [isActive, userId]);
    return result.affectedRows > 0;
  }
};

module.exports = UserRepository;