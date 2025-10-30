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
    const song = rows[0] || null;

    if (song) {
      console.log("🎵 Song found:", song.songId);
      console.log("📝 Lyric:", song.lyric ? "Có lời" : "Không có lời");
    }

    return song;
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
        views, singerId, genreId, releaseDate, popularityScore
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      song.songId, song.title, song.duration, song.fileUrl, song.lyric || null,
      song.coverUrl, song.views || 0, song.singerId, song.genreId,
      song.releaseDate || null, song.popularityScore || 0,
    ];
    const [result] = await pool.query(sql, values);
    return song.songId;
  },

  // 🟢 Cập nhật bài hát
  async update(songId, data) {
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
      WHERE s.title LIKE ? OR si.name LIKE ? OR g.name LIKE ?
      ORDER BY s.releaseDate DESC
    `;
    const [rows] = await pool.query(sql, [searchTerm, searchTerm, searchTerm]);
    return rows;
  },

  // 🟢 Tìm kiếm tất cả (bài hát + ca sĩ + thể loại)
  async searchAll(query) {
    if (!query || query.trim() === '') return { songs: [], singers: [], genres: [] };
    const searchTerm = `%${query}%`;

    const songSql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.title LIKE ?
      ORDER BY s.views DESC
      LIMIT 10
    `;

    const singerSql = `
      SELECT singerId, name, bio, imageUrl
      FROM Singer
      WHERE name LIKE ?
      LIMIT 5
    `;

    const genreSql = `
      SELECT genreId, name, description
      FROM Genre
      WHERE name LIKE ?
      LIMIT 5
    `;

    const [songs] = await pool.query(songSql, [searchTerm]);
    const [singers] = await pool.query(singerSql, [searchTerm]);
    const [genres] = await pool.query(genreSql, [searchTerm]);

    return { songs, singers, genres };
  },

  // 🎵 Lấy bài hát theo ca sĩ
  async findBySingerId(singerId) {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.singerId = ?
      ORDER BY s.views DESC
    `;
    const [rows] = await pool.query(sql, [singerId]);
    return rows;
  },

  // 🎸 Lấy bài hát theo thể loại
  async findByGenreId(genreId) {
    const sql = `
      SELECT 
        s.songId, s.title, s.duration, s.coverUrl, s.fileUrl,
        s.views, s.releaseDate,
        si.singerId, si.name AS singerName,
        g.genreId, g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.genreId = ?
      ORDER BY s.views DESC
    `;
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
      CASE WHEN sf.songId IS NOT NULL THEN 1 ELSE 0 END AS hasFeature
    FROM Song s
    LEFT JOIN Singer si ON s.singerId = si.singerId
    LEFT JOIN Genre g ON s.genreId = g.genreId
    LEFT JOIN SongFeature sf ON s.songId = sf.songId
    ORDER BY s.createdAt DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
},




};

module.exports = SongRepository;
