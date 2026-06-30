const pool = require("../../config/database").promise();

const SingerRepository = {
  // Lấy tất cả nghệ sĩ (Backward compatibility)
  async findAll() {
    const sql = `SELECT singerId, name, bio, imageUrl, isHidden FROM Singer ORDER BY name ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Phân trang & Lọc
  async findAllPaginated({ page, limit, search, sortBy, sortOrder, visibility }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push("name LIKE ?");
      queryParams.push(`%${search}%`);
    }

    if (visibility === "active") {
      whereClauses.push("isHidden = FALSE");
    } else if (visibility === "hidden") {
      whereClauses.push("isHidden = TRUE");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const orderSql = `ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;

    const dataSql = `
      SELECT singerId, name, bio, imageUrl, isHidden,
      (SELECT COUNT(*) FROM Song WHERE singerId = Singer.singerId) as songCount 
      FROM Singer 
      ${whereSql} 
      ${orderSql}
    `;

    const countSql = `SELECT COUNT(*) as total FROM Singer ${whereSql}`;

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

  async findById(singerId) {
    const sql = `SELECT singerId, name, bio, imageUrl, isHidden FROM Singer WHERE singerId = ?`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows[0] || null;
  },

  async hasSongs(singerId) {
    const sql = `SELECT COUNT(*) as count FROM Song WHERE singerId = ?`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows[0].count > 0;
  },

  async create(singer) {
    const sql = `
      INSERT INTO Singer (singerId, name, bio, imageUrl, isHidden) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [singer.singerId, singer.name, singer.bio || "", singer.imageUrl || null, false];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async update(singerId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.bio !== undefined) { fields.push("bio = ?"); values.push(data.bio); }
    if (data.imageUrl !== undefined) { fields.push("imageUrl = ?"); values.push(data.imageUrl); }
    if (data.isHidden !== undefined) { fields.push("isHidden = ?"); values.push(data.isHidden); }

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

  // Bulk actions
  async bulkDelete(singerIds) {
    if (singerIds.length === 0) return 0;
    const placeholders = singerIds.map(() => "?").join(",");
    const sql = `DELETE FROM Singer WHERE singerId IN (${placeholders})`;
    const [result] = await pool.query(sql, singerIds);
    return result.affectedRows;
  },

  async bulkToggleVisibility(singerIds) {
    if (singerIds.length === 0) return 0;
    const placeholders = singerIds.map(() => "?").join(",");
    const sql = `UPDATE Singer SET isHidden = NOT isHidden WHERE singerId IN (${placeholders})`;
    const [result] = await pool.query(sql, singerIds);
    return result.affectedRows;
  },

  async searchByName(keyword) {
    const sql = `SELECT singerId, name, bio, imageUrl, isHidden FROM Singer WHERE name LIKE ? ORDER BY name ASC`;
    const [rows] = await pool.query(sql, [`%${keyword}%`]);
    return rows;
  },
};

module.exports = SingerRepository;
