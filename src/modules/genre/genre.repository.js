const pool = require("../../config/database").promise();

const GenreRepository = {
  async findAll() {
    const sql = `SELECT genreId, name, description, isHidden FROM Genre ORDER BY name ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

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
      SELECT genreId, name, description, isHidden,
      (SELECT COUNT(*) FROM SongGenre WHERE genreId = Genre.genreId) as songCount 
      FROM Genre 
      ${whereSql} 
      ${orderSql}
    `;

    const countSql = `SELECT COUNT(*) as total FROM Genre ${whereSql}`;

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

  async findById(genreId) {
    const sql = `SELECT genreId, name, description, isHidden FROM Genre WHERE genreId = ?`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0] || null;
  },

  async findByName(name) {
    const sql = `SELECT genreId, name, description, isHidden FROM Genre WHERE name = ?`;
    const [rows] = await pool.query(sql, [name]);
    return rows[0] || null;
  },

  async hasSongs(genreId) {
    const sql = `SELECT COUNT(*) as count FROM SongGenre WHERE genreId = ?`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0].count > 0;
  },

  async create(genre) {
    const sql = `
      INSERT INTO Genre (genreId, name, description, isHidden) 
      VALUES (?, ?, ?, ?)
    `;
    const values = [genre.genreId, genre.name, genre.description || "", false];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async update(genreId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.isHidden !== undefined) { fields.push("isHidden = ?"); values.push(data.isHidden); }

    if (fields.length === 0) return false;

    const sql = `UPDATE Genre SET ${fields.join(", ")} WHERE genreId = ?`;
    values.push(genreId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async delete(genreId) {
    const sql = `DELETE FROM Genre WHERE genreId = ?`;
    const [result] = await pool.query(sql, [genreId]);
    return result.affectedRows > 0;
  },

  async bulkDelete(genreIds) {
    if (genreIds.length === 0) return 0;
    const placeholders = genreIds.map(() => "?").join(",");
    const sql = `DELETE FROM Genre WHERE genreId IN (${placeholders})`;
    const [result] = await pool.query(sql, genreIds);
    return result.affectedRows;
  },

  async bulkToggleVisibility(genreIds) {
    if (genreIds.length === 0) return 0;
    const placeholders = genreIds.map(() => "?").join(",");
    const sql = `UPDATE Genre SET isHidden = NOT isHidden WHERE genreId IN (${placeholders})`;
    const [result] = await pool.query(sql, genreIds);
    return result.affectedRows;
  },
};

module.exports = GenreRepository;
