const pool = require("../db/connection").promise();

const RoleRepository = {
  async findAll() {
    const sql = `SELECT roleId, roleName, description, createdAt FROM Role ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(roleId) {
    const sql = `SELECT * FROM Role WHERE roleId = ?`;
    const [rows] = await pool.query(sql, [roleId]);
    return rows[0] || null;
  },

  async findByName(roleName) {
    const sql = `SELECT * FROM Role WHERE roleName = ?`;
    const [rows] = await pool.query(sql, [roleName]);
    return rows[0] || null;
  },

  async create(role) {
    const sql = `
      INSERT INTO Role (roleId, roleName, description)
      VALUES (?, ?, ?)
    `;
    const values = [role.roleId, role.roleName, role.description];
    await pool.query(sql, values);
    return role.roleId;
  },

  async update(roleId, data) {
    const fields = [];
    const values = [];

    if (data.roleName !== undefined) { fields.push("roleName = ?"); values.push(data.roleName); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }

    if (fields.length === 0) return false;

    const sql = `UPDATE Role SET ${fields.join(", ")} WHERE roleId = ?`;
    values.push(roleId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async delete(roleId) {
    const sql = `DELETE FROM Role WHERE roleId = ?`;
    const [result] = await pool.query(sql, [roleId]);
    return result.affectedRows > 0;
  }
};

module.exports = RoleRepository;
