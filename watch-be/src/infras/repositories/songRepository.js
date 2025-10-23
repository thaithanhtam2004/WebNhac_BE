const pool = require("../db/connection").promise();

const SongRepository = {
  // 🟢 Lấy tất cả bài hát (kèm tên ca sĩ và thể loại)
  async findAll() {
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
        s.createdAt,
        si.singerId,
        si.name AS singerName,
        g.genreId,
        g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ORDER BY s.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy chi tiết 1 bài hát (kèm tên ca sĩ + thể loại)
  async findById(songId) {
    const sql = `
      SELECT 
        s.*,
        si.name AS singerName,
        g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.songId = ?
    `;
    const [rows] = await pool.query(sql, [songId]);
    return rows[0] || null;
  },

  // 🟢 Tăng lượt xem
  async increaseView(songId) {
    const sql = `UPDATE Song SET views = views + 1 WHERE songId = ?`;
    await pool.query(sql, [songId]);
    const [rows] = await pool.query(`SELECT views FROM Song WHERE songId = ?`, [songId]);
    return rows[0]?.views || 0;
  },

  // 🟢 Tạo bài hát mới (thêm releaseDate, popularityScore)
  async create(song) {
    const sql = `
      INSERT INTO Song (
        songId, title, duration, fileUrl, lyric, coverUrl, 
        views, singerId, genreId, releaseDate, popularityScore
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      song.songId,
      song.title,
      song.duration,
      song.fileUrl,
      song.lyric,
      song.coverUrl,
      song.views || 0,
      song.singerId,
      song.genreId,
      song.releaseDate || null,
      song.popularityScore || 0,
    ];
    await pool.query(sql, values);
    return song.songId;
  },

  // 🟢 Cập nhật bài hát (thêm releaseDate, popularityScore)
  async update(songId, data) {
    const sql = `
      UPDATE Song
      SET title = ?, duration = ?, fileUrl = ?, lyric = ?, coverUrl = ?, 
          singerId = ?, genreId = ?, releaseDate = ?, popularityScore = ?
      WHERE songId = ?
    `;
    const values = [
      data.title,
      data.duration,
      data.fileUrl,
      data.lyric,
      data.coverUrl,
      data.singerId,
      data.genreId,
      data.releaseDate || null,
      data.popularityScore !== undefined ? data.popularityScore : 0,
      songId,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  // 🔴 Xóa bài hát
  async delete(songId) {
    const sql = `DELETE FROM Song WHERE songId = ?`;
    const [result] = await pool.query(sql, [songId]);
    return result.affectedRows > 0;
  },
};

module.exports = SongRepository;