const pool = require("../db/connection").promise();

const AlbumRepository = {
  async findAll() {
    const sql = `
      SELECT 
        a.albumId,
        a.name AS title,
        a.coverUrl,
        a.description,
        a.totalViews,
        a.releaseDate,
        a.createdAt,
        s.singerId,
        s.name AS singerName
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      ORDER BY a.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(albumId) {
    const sql = `
      SELECT 
        a.albumId,
        a.name AS title,
        a.coverUrl,
        a.description,
        a.totalViews,
        a.releaseDate,
        a.createdAt,
        s.name AS singerName
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      WHERE a.albumId = ?
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows[0] || null;
  },

  async findBySingerId(singerId) {
    const sql = `
      SELECT 
        albumId,
        name AS title,
        coverUrl,
        releaseDate
      FROM Album
      WHERE singerId = ?
      ORDER BY releaseDate DESC
    `;
    const [rows] = await pool.query(sql, [singerId]);
    return rows;
  },

  // ✅ SEARCH ALBUM (QUAN TRỌNG)
  async search(query) {
    if (!query || query.trim() === "") return [];
    const searchTerm = `%${query}%`;

    const sql = `
      SELECT 
        a.albumId,
        a.name AS title,
        a.coverUrl,
        s.name AS singerName
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      WHERE a.name LIKE ? OR s.name LIKE ?
      LIMIT 5
    `;

    const [rows] = await pool.query(sql, [searchTerm, searchTerm]);
    return rows;
  },
};

module.exports = AlbumRepository;
