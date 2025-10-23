const pool = require("../db/connection").promise();

const AlbumRepository = {
  async findAll() {
    const sql = `SELECT albumId, name, singerId, coverUrl, description, releaseDate, totalViews, createdAt
    FROM Album ORDER BY createdAt DESC`;

    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(albumId) {
    const sql = `SELECT * FROM Album WHERE albumId = ?`; // đã lấy tất cả cột, nên releaseDate và totalViews sẽ tự có

    const [rows] = await pool.query(sql, [albumId]);
    return rows[0] || null;
  },

  async create(album) {
    const sql = `INSERT INTO Album (albumId, name, singerId, coverUrl, description, releaseDate, totalViews)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      album.albumId,
      album.name,
      album.singerId,
      album.coverUrl,
      album.description,
      album.releaseDate || null,
      album.totalViews || 0,
    ];

    await pool.query(sql, values);
    return album.albumId;
  },

  async update(albumId, data) {
    const fields = [];
    const values = [];
    if (data.name !== undefined) {
      fields.push("name = ?");
      values.push(data.name);
    }
    if (data.singerId !== undefined) {
      fields.push("singerId = ?");
      values.push(data.singerId);
    }
    if (data.coverUrl !== undefined) {
      fields.push("coverUrl = ?");
      values.push(data.coverUrl);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.releaseDate !== undefined) {
      fields.push("releaseDate = ?");
      values.push(data.releaseDate);
    }
    if (data.totalViews !== undefined) {
      fields.push("totalViews = ?");
      values.push(data.totalViews);
    }

    if (fields.length === 0) return false;

    const sql = `UPDATE Album SET ${fields.join(", ")} WHERE albumId = ?`;
    values.push(albumId);

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async delete(albumId) {
    const sql = `DELETE FROM Album WHERE albumId = ?`;
    const [result] = await pool.query(sql, [albumId]);
    return result.affectedRows > 0;
  },
};

module.exports = AlbumRepository;
