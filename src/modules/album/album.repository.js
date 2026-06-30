const pool = require("../../config/database").promise();

const AlbumRepository = {
  // Lấy tất cả (backward compatibility)
  async findAll() {
    const sql = `
      SELECT a.albumId, a.name, a.singerId, a.coverUrl, a.description, a.releaseDate, a.createdAt, a.isHidden,
      COALESCE((SELECT SUM(s.views) FROM Song s JOIN AlbumSong als ON s.songId = als.songId WHERE als.albumId = a.albumId), 0) as totalViews,
      s.name as singerName 
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      ORDER BY a.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // Phân trang & Lọc
  async findAllPaginated({ page, limit, search, sortBy, sortOrder, visibility }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let queryParams = [];

    if (search) {
      whereClauses.push("a.name LIKE ?");
      queryParams.push(`%${search}%`);
    }

    if (visibility === "active") {
      whereClauses.push("a.isHidden = FALSE");
    } else if (visibility === "hidden") {
      whereClauses.push("a.isHidden = TRUE");
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    
    // Default sorting
    let validSortBy = "a.createdAt";
    if (sortBy === "name") validSortBy = "a.name";
    else if (sortBy === "releaseDate") validSortBy = "a.releaseDate";
    else if (sortBy === "totalViews") validSortBy = "totalViews";

    const orderSql = `ORDER BY ${validSortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;

    const dataSql = `
      SELECT a.albumId, a.name, a.singerId, a.coverUrl, a.description, a.releaseDate, a.createdAt, a.isHidden,
      COALESCE((SELECT SUM(s.views) FROM Song s JOIN AlbumSong als ON s.songId = als.songId WHERE als.albumId = a.albumId), 0) as totalViews,
      s.name as singerName,
      (SELECT COUNT(*) FROM AlbumSong WHERE albumId = a.albumId) as songCount
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      ${whereSql} 
      ${orderSql}
    `;

    const countSql = `SELECT COUNT(*) as total FROM Album a ${whereSql}`;

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

  async findById(albumId) {
    const sql = `
      SELECT a.albumId, a.name, a.singerId, a.coverUrl, a.description, a.releaseDate, a.createdAt, a.isHidden,
      COALESCE((SELECT SUM(s.views) FROM Song s JOIN AlbumSong als ON s.songId = als.songId WHERE als.albumId = a.albumId), 0) as totalViews,
      s.name as singerName 
      FROM Album a
      LEFT JOIN Singer s ON a.singerId = s.singerId
      WHERE a.albumId = ?
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows[0] || null;
  },

  async hasSongs(albumId) {
    const sql = `SELECT COUNT(*) as count FROM AlbumSong WHERE albumId = ?`;
    const [rows] = await pool.query(sql, [albumId]);
    return rows[0].count > 0;
  },

  async create(album) {
    const sql = `
      INSERT INTO Album (albumId, name, singerId, coverUrl, description, releaseDate, totalViews, isHidden) 
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `;
    const values = [
      album.albumId, 
      album.name, 
      album.singerId, 
      album.coverUrl || null, 
      album.description || "", 
      album.releaseDate || null,
      false
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async update(albumId, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) { fields.push("name = ?"); values.push(data.name); }
    if (data.singerId !== undefined) { fields.push("singerId = ?"); values.push(data.singerId); }
    if (data.coverUrl !== undefined) { fields.push("coverUrl = ?"); values.push(data.coverUrl); }
    if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
    if (data.releaseDate !== undefined) { fields.push("releaseDate = ?"); values.push(data.releaseDate); }
    if (data.isHidden !== undefined) { fields.push("isHidden = ?"); values.push(data.isHidden); }

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

  async bulkDelete(albumIds) {
    if (albumIds.length === 0) return 0;
    const placeholders = albumIds.map(() => "?").join(",");
    const sql = `DELETE FROM Album WHERE albumId IN (${placeholders})`;
    const [result] = await pool.query(sql, albumIds);
    return result.affectedRows;
  },

  async bulkToggleVisibility(albumIds) {
    if (albumIds.length === 0) return 0;
    const placeholders = albumIds.map(() => "?").join(",");
    const sql = `UPDATE Album SET isHidden = NOT isHidden WHERE albumId IN (${placeholders})`;
    const [result] = await pool.query(sql, albumIds);
    return result.affectedRows;
  },
};

module.exports = AlbumRepository;
