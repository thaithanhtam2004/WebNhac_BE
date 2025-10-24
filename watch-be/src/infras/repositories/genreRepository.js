const pool = require("../db/connection").promise();

const GenreRepository = {
  // 🟢 Lấy tất cả thể loại
  async findAll() {
    const sql = `
      SELECT 
        g.genreId,
        g.name,
        g.description
      FROM Genre g
      ORDER BY g.name ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy chi tiết 1 thể loại
  async findById(genreId) {
    const sql = `
      SELECT 
        g.genreId,
        g.name,
        g.description
      FROM Genre g
      WHERE g.genreId = ?
    `;
    const [rows] = await pool.query(sql, [genreId]);
    return rows[0] || null;
  },

  // 🟢 Tìm thể loại theo tên
  async findByName(name) {
    const sql = `
      SELECT 
        g.genreId,
        g.name,
        g.description
      FROM Genre g
      WHERE g.name = ?
    `;
    const [rows] = await pool.query(sql, [name]);
    return rows[0] || null;
  },

  // 🟢 Tạo thể loại mới
  async create({ genreId, name, description }) {
    try {
      const sql = `
        INSERT INTO Genre (genreId, name, description)
        VALUES (?, ?, ?)
      `;
      const values = [genreId, name, description || null];
      await pool.query(sql, values);
      return { genreId, name, description };
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        throw new Error("Tên thể loại đã tồn tại.");
      }
      throw err;
    }
  },

  // 🟢 Cập nhật thể loại
  async update(genreId, data) {
    const sql = `
      UPDATE Genre
      SET name = ?, description = ?
      WHERE genreId = ?
    `;
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
};

module.exports = GenreRepository;
