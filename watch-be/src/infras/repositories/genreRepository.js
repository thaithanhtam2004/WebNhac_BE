const pool = require('../db/connection').promise();

const GenreRepository = {
  // Lấy tất cả thể loại
  async findAll() {
    const sql = `
      SELECT genreId, name, description
      FROM Genre
      ORDER BY name ASC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Tìm thể loại theo ID
  async findById(genreId) {
    const sql = 'SELECT * FROM Genre WHERE genreId = ?';
    const [rows] = await pool.query(sql, [genreId]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Tìm thể loại theo tên
  async findByName(name) {
    const sql = 'SELECT * FROM Genre WHERE name = ?';
    const [rows] = await pool.query(sql, [name]);
    return rows.length > 0 ? rows[0] : null;
  },

  // Thêm thể loại mới
  async create({ name, description }) {
    try {
      const sql = `
        INSERT INTO Genre (name, description)
        VALUES (?, ?)
      `;
      const [result] = await pool.query(sql, [name, description]);
      return {
        genreId: result.insertId,
        name,
        description
      };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Tên thể loại đã tồn tại.');
      }
      throw err;
    }
  },

  // Cập nhật thể loại
  async update(genreId, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) return false;

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const sql = `UPDATE Genre SET ${setClause} WHERE genreId = ?`;
    const [result] = await pool.query(sql, [...values, genreId]);

    return result.affectedRows > 0;
  },

  // Xóa thể loại
  async delete(genreId) {
    const sql = 'DELETE FROM Genre WHERE genreId = ?';
    const [result] = await pool.query(sql, [genreId]);
    return result.affectedRows > 0;
  }
};

module.exports = GenreRepository;
