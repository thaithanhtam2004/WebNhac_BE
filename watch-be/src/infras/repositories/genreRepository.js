const pool = require("../db/connection").promise();

const GenreRepository = {
  // 🟢 Lấy tất cả thể loại
  async findAll() {
    const sql = `SELECT genreId, name, description FROM Genre ORDER BY name ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy chi tiết 1 thể loại
  async findById(genreId) {
    const sql = `SELECT genreId, name, description FROM Genre WHERE genreId = ?`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0] || null;
  },

  // ✅ [MỚI] Kiểm tra trùng tên (Create/Update)
  async checkDuplicate(name, excludeGenreId = null) {
    let sql = `SELECT genreId FROM Genre WHERE name = ?`;
    const params = [name];

    if (excludeGenreId) {
      sql += ` AND genreId != ?`;
      params.push(excludeGenreId);
    }

    const [rows] = await pool.query(sql, params);
    return rows.length > 0;
  },

  // ✅ [MỚI] Kiểm tra thể loại có bài hát nào không (Delete)
  async hasSongs(genreId) {
    const sql = `SELECT COUNT(*) as count FROM Song WHERE genreId = ?`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0].count > 0;
  },

  // 🟢 Tạo thể loại mới
  async create({ genreId, name, description }) {
    const sql = `INSERT INTO Genre (genreId, name, description) VALUES (?, ?, ?)`;
    const values = [genreId, name, description || null];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🟢 Cập nhật thể loại
  async update(genreId, data) {
    const sql = `UPDATE Genre SET name = ?, description = ? WHERE genreId = ?`;
    const values = [data.name, data.description || null, genreId];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🔴 Xóa thể loại
  async delete(genreId) {
    const sql = `DELETE FROM Genre WHERE genreId = ?`;
    const [result] = await pool.query(sql, [genreId]);
    return result.affectedRows > 0;
  },

  async findById(genreId) {
    const sql = `SELECT * FROM Genre WHERE genreId = ?`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0] || null;
  },
};

module.exports = GenreRepository;