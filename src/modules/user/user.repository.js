const pool = require("../../config/database").promise();

const UserRepository = {
  async findAll() {
    const sql = `
      SELECT u.userId, u.name, u.email, u.phone, u.roleId, u.isActive, u.createdAt, r.roleName
      FROM User u LEFT JOIN Role r ON u.roleId = r.roleId
      WHERE u.roleId = '1'
      ORDER BY u.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findAllPaginated({ page, limit, search, sortBy, sortOrder, status }) {
    const offset = (page - 1) * limit;
    let whereClauses = ["u.roleId = '1'"];
    let queryParams = [];

    if (search) {
      whereClauses.push("(u.name LIKE ? OR u.email LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (status === "active") {
      whereClauses.push("u.isActive = 1");
    } else if (status === "inactive") {
      whereClauses.push("u.isActive = 0");
    }

    const whereSql = `WHERE ${whereClauses.join(" AND ")}`;
    
    let validSortBy = "u.createdAt";
    if (sortBy === "name") validSortBy = "u.name";
    else if (sortBy === "email") validSortBy = "u.email";

    const orderSql = `ORDER BY ${validSortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;

    const dataSql = `
      SELECT u.userId, u.name, u.email, u.phone, u.roleId, u.isActive, u.createdAt, r.roleName
      FROM User u 
      LEFT JOIN Role r ON u.roleId = r.roleId
      ${whereSql} 
      ${orderSql}
    `;

    const countSql = `SELECT COUNT(*) as total FROM User u ${whereSql}`;

    const [dataRows] = await pool.query(dataSql, [...queryParams, limit, offset]);
    const [countRows] = await pool.query(countSql, queryParams);

    return {
      data: dataRows,
      total: countRows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countRows[0].total / limit),
    };
  },

  async findByEmailWithRole(email) {
    const sql = `
      SELECT u.userId, u.name, u.email, u.password, u.phone, u.roleId, u.isActive, r.roleName
      FROM User u LEFT JOIN Role r ON u.roleId = r.roleId
      WHERE u.email = ?
    `;
    const [rows] = await pool.query(sql, [email]);
    return rows[0] || null;
  },

  async findById(userId) {
    const sql = `
      SELECT u.userId, u.name, u.email, u.phone, u.roleId, u.isActive, u.createdAt, r.roleName
      FROM User u LEFT JOIN Role r ON u.roleId = r.roleId
      WHERE u.userId = ?
    `;
    const [rows] = await pool.query(sql, [userId]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const sql = `SELECT * FROM User WHERE email = ?`;
    const [rows] = await pool.query(sql, [email]);
    return rows[0] || null;
  },

  async existsByEmail(email) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS count FROM User WHERE email = ?`, [email]);
    return rows[0].count > 0;
  },

  async create(user) {
    const sql = `
      INSERT INTO User (userId, name, email, phone, password, roleId, isActive)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `;
    const values = [user.userId, user.name, user.email, user.phone, user.password, user.roleId || null];
    await pool.query(sql, values);
    return user.userId;
  },

  async updatePassword(userId, hashedPassword) {
    const [result] = await pool.query(`UPDATE User SET password = ? WHERE userId = ?`, [hashedPassword, userId]);
    return result.affectedRows > 0;
  },

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

  async updateStatus(userId, isActive) {
    const [result] = await pool.query(`UPDATE User SET isActive = ? WHERE userId = ?`, [isActive ? 1 : 0, userId]);
    return result.affectedRows > 0;
  },

  async disable(userId) {
    return await this.updateStatus(userId, false);
  },

  async enable(userId) {
    return await this.updateStatus(userId, true);
  },

  async bulkUpdateStatus(userIds, isActive) {
    if (userIds.length === 0) return 0;
    const placeholders = userIds.map(() => "?").join(",");
    const sql = `UPDATE User SET isActive = ? WHERE userId IN (${placeholders})`;
    const [result] = await pool.query(sql, [isActive ? 1 : 0, ...userIds]);
    return result.affectedRows;
  },
  
  async bulkDelete(userIds) {
    if (userIds.length === 0) return 0;
    const placeholders = userIds.map(() => "?").join(",");
    const sql = `DELETE FROM User WHERE userId IN (${placeholders})`;
    const [result] = await pool.query(sql, userIds);
    return result.affectedRows;
  },

  async delete(userId) {
    const sql = `DELETE FROM User WHERE userId = ?`;
    const [result] = await pool.query(sql, [userId]);
    return result.affectedRows > 0;
  }
};

module.exports = UserRepository;
