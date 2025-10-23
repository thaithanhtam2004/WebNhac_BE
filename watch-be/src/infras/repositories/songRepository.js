const pool = require("../db/connection").promise();

const SongRepository = {
  // 🟢 Lấy tất cả bài hát
  async findAll() {
    const sql = `SELECT songId, title, duration, coverUrl, singerId, genreId, views, popularityScore, releaseDate, createdAt
                 FROM Song ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy chi tiết 1 bài hát
  async findById(songId) {
    const sql = `SELECT * FROM Song WHERE songId = ?`;
    const [rows] = await pool.query(sql, [songId]);
    return rows[0] || null;
  },

  // 🟢 Tăng lượt xem
  async increaseView(songId) {
    const sql = `UPDATE Song SET views = views + 1 WHERE songId = ?`;
    await pool.query(sql, [songId]);
    const [rows] = await pool.query(`SELECT views FROM Song WHERE songId = ?`, [
      songId,
    ]);
    return rows[0]?.views || 0;
  },

  // 🟢 Tạo bài hát mới
  async create(song) {
    const sql = `
      INSERT INTO Song (songId, title, duration, fileUrl, lyric, coverUrl, views, singerId, genreId, releaseDate, popularityScore)
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

  // 🟢 Cập nhật bài hát
  async update(songId, data) {
    const fields = [];
    const values = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.duration !== undefined) {
      fields.push("duration = ?");
      values.push(data.duration);
    }
    if (data.fileUrl !== undefined) {
      fields.push("fileUrl = ?");
      values.push(data.fileUrl);
    }
    if (data.lyric !== undefined) {
      fields.push("lyric = ?");
      values.push(data.lyric);
    }
    if (data.coverUrl !== undefined) {
      fields.push("coverUrl = ?");
      values.push(data.coverUrl);
    }
    if (data.singerId !== undefined) {
      fields.push("singerId = ?");
      values.push(data.singerId);
    }
    if (data.genreId !== undefined) {
      fields.push("genreId = ?");
      values.push(data.genreId);
    }
    if (data.releaseDate !== undefined) {
      fields.push("releaseDate = ?");
      values.push(data.releaseDate);
    }
    if (data.popularityScore !== undefined) {
      fields.push("popularityScore = ?");
      values.push(data.popularityScore);
    }

    if (fields.length === 0) return false;

    const sql = `UPDATE Song SET ${fields.join(", ")} WHERE songId = ?`;
    values.push(songId);

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
