const pool = require("../db/connection").promise();

const SongRepository = {
  // 🟢 Lấy tất cả bài hát
  async findAll() {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.lyric, s.views, s.releaseDate, s.popularityScore, s.createdAt,
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

  // 🔴 Xóa bài hát
  async delete(songId) {
    const [result] = await pool.query(`DELETE FROM Song WHERE songId = ?`, [songId]);
    return result.affectedRows > 0;
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
      WHERE s.title LIKE ? OR si.name LIKE ?
      ORDER BY s.releaseDate DESC
    `;
    const [rows] = await pool.query(sql, [searchTerm, searchTerm]);
    return rows;
  },

async searchAll(query) {
    if (!query || query.trim() === '') {
      return { songs: [], singers: [], genres: [], albums: [] };
    }

    const searchTerm = `%${query}%`;
    
    // Khởi tạo kết quả mặc định
    let result = { songs: [], singers: [], genres: [], albums: [] };

    // 1. Tìm Bài Hát
    try {
        const [songs] = await pool.query(`
          SELECT s.songId, s.title, s.coverUrl, s.fileUrl, s.duration,
                 si.name AS singerName
          FROM Song s 
          LEFT JOIN Singer si ON s.singerId = si.singerId
          WHERE s.title LIKE ?
          LIMIT 10
        `, [searchTerm]);
        result.songs = songs;
    } catch (err) {
        console.error("❌ LỖI SQL (SONG):", err.message);
    }

    // 2. Tìm Nghệ Sĩ
    try {
        const [singers] = await pool.query(`
          SELECT singerId, name, imageUrl 
          FROM Singer 
          WHERE name LIKE ?
          LIMIT 5
        `, [searchTerm]);
        result.singers = singers;
    } catch (err) {
        console.error("❌ LỖI SQL (SINGER):", err.message);
    }

    // 3. Tìm Thể Loại
    try {
        const [genres] = await pool.query(`
          SELECT genreId, name 
          FROM Genre 
          WHERE name LIKE ?
          LIMIT 5
        `, [searchTerm]);
        result.genres = genres;
    } catch (err) {
        console.error("❌ LỖI SQL (GENRE):", err.message);
    }

    // 4. Tìm Album (Đã đổi 'a.title' thành 'a.name' để tránh lỗi)
    try {
        const [albums] = await pool.query(`
            SELECT a.albumId, a.name AS title, a.coverUrl, s.name AS singerName
            FROM Album a
            LEFT JOIN Singer s ON a.singerId = s.singerId
            WHERE a.name LIKE ?
            LIMIT 5
        `, [searchTerm]);
        result.albums = albums;
    } catch (err) {
        console.error("❌ LỖI SQL (ALBUM):", err.message);
    }

    return result;
  },

  async findBySingerId(singerId) {
    const sql = `SELECT * FROM Song WHERE singerId = ? ORDER BY views DESC`;
    const [rows] = await pool.query(sql, [singerId]);
    return rows;
  },

  async findByGenreId(genreId) {
    const sql = `SELECT * FROM Song WHERE genreId = ? ORDER BY views DESC`;
    const [rows] = await pool.query(sql, [genreId]);
    return rows;
  },


  // 🟢 Lấy tất cả bài hát, kèm flag hasFeature (1 nếu có trong SongFeature)
async findAllWithFeature() {
  const sql = `
    SELECT 
      s.songId,
      s.title,
      s.duration,
      s.coverUrl,
      s.fileUrl,
      s.views,
      s.releaseDate,
      s.popularityScore,

      si.singerId,
      si.name AS singerName,

      g.genreId,
      g.name AS genreName,

      CASE 
        WHEN sf.songId IS NOT NULL THEN 1 
        ELSE 0 
      END AS hasFeature,

      sf.emotionId,
      e.name AS emotionName

    FROM Song s
    LEFT JOIN Singer si ON s.singerId = si.singerId
    LEFT JOIN Genre g ON s.genreId = g.genreId
    LEFT JOIN SongFeature sf ON s.songId = sf.songId
    LEFT JOIN Emotion e ON sf.emotionId = e.emotionId
    ORDER BY s.createdAt DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
}
,
  async findHotTrend(limit = 10) {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate, s.popularityScore,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ORDER BY s.popularityScore DESC, s.releaseDate DESC
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  },

// 🎲 Lấy bài hát ngẫu nhiên làm dự phòng khi không có gợi ý
  async findRandom(limit = 10) {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate, s.popularityScore,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ORDER BY RAND()
      LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);

    return rows;
  },

  async findHotTrend(limit = 10) {
    const sql = `
      SELECT s.*, si.name AS singerName 
      FROM Song s LEFT JOIN Singer si ON s.singerId = si.singerId
      ORDER BY s.popularityScore DESC, s.releaseDate DESC LIMIT ?
    `;
    const [rows] = await pool.query(sql, [limit]);
    return rows;
  },

  async findByAlbumId(albumId) {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate, s.popularityScore,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      INNER JOIN AlbumSong asong ON s.songId = asong.songId
      WHERE asong.albumId = ?
      ORDER BY asong.trackNumber ASC, s.title ASC
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows;
  },

};

module.exports = SongRepository;