const pool = require("../db/connection").promise();

const AlbumRepository = {
  // 🟢 Lấy tất cả album cùng thông tin ca sĩ
  async findAll() {
    const sql = `
      SELECT 
        a.albumId,
        a.name,
        a.singerId,
        s.name AS singerName,
        a.coverUrl,
        a.description,
        a.totalViews,
        a.releaseDate,
        a.createdAt
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      ORDER BY a.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy album theo ID
  async findById(albumId) {
    const sql = `
      SELECT 
        a.albumId,
        a.name,
        a.singerId,
        s.name AS singerName,
        a.coverUrl,
        a.description,
        a.totalViews,
        a.releaseDate,
        a.createdAt
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      WHERE a.albumId = ?
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows[0] || null;
  },

  // 🟢 Lấy danh sách album theo ca sĩ
  async findBySingerId(singerId) {
    const sql = `
      SELECT albumId, name, coverUrl, description, totalViews, releaseDate, createdAt
      FROM Album
      WHERE singerId = ?
      ORDER BY createdAt DESC
    `;
    const [rows] = await pool.query(sql, [singerId]);
    return rows;
  },

  // 🟢 Tạo album mới
  async create(album) {
    const sql = `
      INSERT INTO Album (albumId, name, singerId, coverUrl, description, totalViews, releaseDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      album.albumId,
      album.name,
      album.singerId,
      album.coverUrl || null,
      album.description || null,
      album.totalViews || 0,
      album.releaseDate || null,
    ];
    await pool.query(sql, values);
    return album.albumId;
  },

  // 🟢 Cập nhật album
  async update(albumId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.singerId !== undefined) { fields.push("singerId = ?"); values.push(data.singerId); }
    if (data.coverUrl !== undefined) { fields.push("coverUrl = ?"); values.push(data.coverUrl); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.totalViews !== undefined) { fields.push("totalViews = ?"); values.push(data.totalViews); }
    if (data.releaseDate !== undefined) { fields.push("releaseDate = ?"); values.push(data.releaseDate); }

    if (fields.length === 0) return false;

    const sql = `UPDATE Album SET ${fields.join(", ")} WHERE albumId = ?`;
    values.push(albumId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🟢 Xóa album
  async delete(albumId) {
    const [result] = await pool.query(`DELETE FROM Album WHERE albumId = ?`, [albumId]);
    return result.affectedRows > 0;
  },
};

module.exports = AlbumRepository;
