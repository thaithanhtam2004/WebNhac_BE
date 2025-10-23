const pool = require("../db/connection").promise();

const UserRepository = {
  async findAll() {
    const sql = `SELECT userId, name, email, phone, roleId, isActive, createdAt
                 FROM User ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(userId) {
    const sql = `SELECT userId, name, email, phone, roleId, isActive, createdAt
                 FROM User WHERE userId = ?`;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const sql = `SELECT * FROM User WHERE email = ?`;
    const [rows] = await pool.query(sql, [email]);
    return rows[0] || null;
  },

  async create(user) {
    const sql = `
      INSERT INTO User (userId, name, email, phone, password, roleId)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
      user.userId,
      user.name,
      user.email,
      user.phone,
      user.password,
      user.roleId || null,
    ];
    await pool.query(sql, values);
    return user.userId;
  },

  async updatePassword(userId, hashedPassword) {
    const sql = `UPDATE User SET password = ? WHERE userId = ?`;
    const [result] = await pool.query(sql, [hashedPassword, userId]);
    return result.affectedRows > 0;
  },

  async disableUser(userId) {
    const sql = `UPDATE User SET isActive = FALSE WHERE userId = ?`;
    const [result] = await pool.query(sql, [userId]);
    return result.affectedRows > 0;
  },
};

module.exports = UserRepository;
