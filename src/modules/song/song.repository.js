const pool = require("../../config/database").promise();

const SongRepository = {
  // 🟢 Lấy tất cả bài hát
  async findAll() {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.lyric, s.views, s.releaseDate, s.popularityScore, s.createdAt, s.isHidden,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ORDER BY s.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },
  // ✅ [MỚI] Lấy danh sách có lọc và phân trang
  async findWithFilters({ page = 1, limit = 10, search = "", genreId = "", singerId = "", sortBy = "createdAt", sortOrder = "desc", visibility = "all" }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];
    let countParams = [];

    if (search) {
      whereClauses.push(`(s.title LIKE ? OR si.name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (genreId) {
      whereClauses.push(`s.genreId = ?`);
      params.push(genreId);
      countParams.push(genreId);
    }
    if (singerId) {
      whereClauses.push(`s.singerId = ?`);
      params.push(singerId);
      countParams.push(singerId);
    }
    if (visibility === "visible") {
      whereClauses.push(`s.isHidden = 0`);
    } else if (visibility === "hidden") {
      whereClauses.push(`s.isHidden = 1`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ` + whereClauses.join(" AND ") : "";
    
    // Validate sortBy to prevent SQL Injection
    const validSortColumns = ['createdAt', 'views', 'title', 'releaseDate'];
    const sortColumn = validSortColumns.includes(sortBy) ? `s.${sortBy}` : 's.createdAt';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countSql = `
      SELECT COUNT(*) as total
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      ${whereSql}
    `;
    const [[{ total }]] = await pool.query(countSql, countParams);

    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.lyric, s.views, s.releaseDate, s.popularityScore, s.createdAt, s.isHidden,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ${whereSql}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    
    const [rows] = await pool.query(sql, params);
    
    return {
      data: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  },


  // 🟢 Lấy chi tiết bài hát
  async findById(songId) {
    const sql = `
      SELECT 
        s.*, si.name AS singerName, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.songId = ?
    `;
    const [rows] = await pool.query(sql, [songId]);
    return rows[0] || null;
  },

  // ✅ [MỚI] Kiểm tra trùng lặp (Cùng tên + Cùng ca sĩ)
  // excludeSongId dùng khi update (để không tự so sánh với chính nó)
  async checkDuplicate(title, singerId, excludeSongId = null) {
    let sql = `SELECT songId FROM Song WHERE title = ? AND singerId = ?`;
    const params = [title, singerId];

    if (excludeSongId) {
      sql += ` AND songId != ?`;
      params.push(excludeSongId);
    }

    const [rows] = await pool.query(sql, params);
    return rows.length > 0; // Trả về true nếu đã tồn tại
  },

  // 🟢 Tăng lượt xem
  async increaseView(songId) {
    await pool.query(`UPDATE Song SET views = views + 1 WHERE songId = ?`, [songId]);
    const [rows] = await pool.query(`SELECT views FROM Song WHERE songId = ?`, [songId]);
    return rows[0]?.views || 0;
  },

  // 🟢 Tạo bài hát
  async create(song) {
    const sql = `
      INSERT INTO Song (
        songId, title, duration, fileUrl, lyric, coverUrl, 
        views, singerId, genreId, releaseDate, popularityScore, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
      song.songId, song.title, song.duration, song.fileUrl, song.lyric || null,
      song.coverUrl, song.views || 0, song.singerId, song.genreId,
      song.releaseDate || null, song.popularityScore || 0,
    ];
    await pool.query(sql, values);
    return song.songId;
  },

  // 🟢 Cập nhật bài hát
  async update(songId, data) {
    // Chỉ cập nhật các trường có giá trị (Dynamic Update)
    // Lưu ý: Code dưới đây giả định data chứa đầy đủ thông tin cần update như service truyền xuống
    const sql = `
      UPDATE Song
      SET title = ?, duration = ?, fileUrl = ?, lyric = ?, coverUrl = ?, 
          singerId = ?, genreId = ?, releaseDate = ?, popularityScore = ?
      WHERE songId = ?
    `;
    const values = [
      data.title, data.duration, data.fileUrl, data.lyric || null, data.coverUrl,
      data.singerId, data.genreId, data.releaseDate || null,
      data.popularityScore !== undefined ? data.popularityScore : 0,
      songId,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  
  // ✅ [MỚI] Ẩn / Hiện bài hát
  async toggleVisibility(songId) {
    const sql = `UPDATE Song SET isHidden = NOT isHidden WHERE songId = ?`;
    const [result] = await pool.query(sql, [songId]);
    return result.affectedRows > 0;
  },

  // ✅ [MỚI] Ẩn / Hiện hàng loạt
  async bulkToggleVisibility(songIds) {
    if (!songIds || songIds.length === 0) return false;
    const placeholders = songIds.map(() => '?').join(',');
    const sql = `UPDATE Song SET isHidden = NOT isHidden WHERE songId IN (${placeholders})`;
    const [result] = await pool.query(sql, songIds);
    return result.affectedRows > 0;
  },

  // ✅ [MỚI] Xóa hàng loạt bài hát
  async bulkDelete(songIds) {
    if (!songIds || songIds.length === 0) return false;
    const placeholders = songIds.map(() => '?').join(',');
    const sql = `DELETE FROM Song WHERE songId IN (${placeholders})`;
    const [result] = await pool.query(sql, songIds);
    return result.affectedRows > 0;
  },

  // 🔴 Xóa bài hát
  async delete(songId) {
    const [result] = await pool.query(`DELETE FROM Song WHERE songId = ?`, [songId]);
    return result.affectedRows > 0;
  },

  // 🟢 Lấy nhiều bài hát theo IDs (phục vụ lấy fileUrl, coverUrl trước khi xóa hàng loạt)
  async findByIds(songIds) {
    if (!songIds || songIds.length === 0) return [];
    const placeholders = songIds.map(() => '?').join(',');
    const sql = `SELECT songId, fileUrl, coverUrl FROM Song WHERE songId IN (${placeholders})`;
    const [rows] = await pool.query(sql, songIds);
    return rows;
  },

  // 🟢 Lấy theo ngày phát hành mới nhất
  async findByReleaseDateDesc() {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate, s.popularityScore,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.isHidden = 0
      ORDER BY s.releaseDate DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Tìm kiếm bài hát
  async searchSongs(query) {
    if (!query || query.trim() === '') return [];
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate, s.popularityScore,
        si.name AS singerName, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE (s.title LIKE ? OR si.name LIKE ?) AND s.isHidden = 0
      ORDER BY s.releaseDate DESC
    `;
    const [rows] = await pool.query(sql, [searchTerm, searchTerm]);
    return rows;
  },

  // 🟢 Tìm kiếm tất cả
  async searchAll(query) {
    if (!query || query.trim() === '') return { songs: [], singers: [], genres: [], albums: [] };
    const searchTerm = `%${query}%`;

    const songSql = `
      SELECT s.songId, s.title, s.coverUrl, s.fileUrl, si.name AS singerName 
      FROM Song s LEFT JOIN Singer si ON s.singerId = si.singerId
      WHERE s.title LIKE ? AND s.isHidden = 0 LIMIT 10
    `;
    const singerSql = `SELECT singerId, name, imageUrl FROM Singer WHERE name LIKE ? AND isHidden = 0 LIMIT 5`;
    const genreSql = `SELECT genreId, name FROM Genre WHERE name LIKE ? AND isHidden = 0 LIMIT 5`;
    const albumSql = `
      SELECT a.albumId, a.name AS title, a.coverUrl, si.name AS singerName
      FROM Album a LEFT JOIN Singer si ON a.singerId = si.singerId
      WHERE a.name LIKE ? AND a.isHidden = 0 LIMIT 5
    `;

    const [songs] = await pool.query(songSql, [searchTerm]);
    const [singers] = await pool.query(singerSql, [searchTerm]);
    const [genres] = await pool.query(genreSql, [searchTerm]);
    const [albums] = await pool.query(albumSql, [searchTerm]);

    return { songs, singers, genres, albums };
  },

  async findBySingerId(singerId) {
    const sql = `SELECT * FROM Song WHERE singerId = ? AND isHidden = 0 ORDER BY views DESC`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows;
  },

  async findByGenreId(genreId) {
    const sql = `SELECT * FROM Song WHERE genreId = ? AND isHidden = 0 ORDER BY views DESC`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows;
  },

  async findAllWithFeature() {
    const sql = `
      SELECT s.*, CASE WHEN sf.songId IS NOT NULL THEN 1 ELSE 0 END AS hasFeature
      FROM Song s LEFT JOIN SongFeature sf ON s.songId = sf.songId
      WHERE s.isHidden = 0
      ORDER BY s.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findAllWithFeaturePaginated({ page = 1, limit = 10, search = "" }) {
    const offset = (page - 1) * limit;
    let whereClauses = ["s.isHidden = 0"];
    let params = [];

    if (search) {
      whereClauses.push(`(s.title LIKE ? OR si.name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = "WHERE " + whereClauses.join(" AND ");
    
    const countSql = `
      SELECT COUNT(*) as total 
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      ${whereSql}
    `;
    const [[{ total }]] = await pool.query(countSql, params);

    const sql = `
      SELECT s.songId, s.title, s.releaseDate, si.name AS singerName, g.name AS genreName,
             CASE WHEN sf.songId IS NOT NULL THEN 1 ELSE 0 END AS hasFeature
      FROM Song s 
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      LEFT JOIN SongFeature sf ON s.songId = sf.songId
      ${whereSql}
      ORDER BY s.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    
    const [rows] = await pool.query(sql, params);
    
    return {
      data: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  },

  async findHotTrend(limit = 10) {
    const sql = `
      SELECT s.*, si.name AS singerName 
      FROM Song s LEFT JOIN Singer si ON s.singerId = si.singerId
      WHERE s.isHidden = 0
      ORDER BY s.popularityScore DESC, s.releaseDate DESC LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  },
};

module.exports = SongRepository;