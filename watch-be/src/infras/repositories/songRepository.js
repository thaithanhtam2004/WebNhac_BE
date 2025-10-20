const pool = require("../db/connection").promise();

const SongRepository = {
  async findAll() {
    const sql = `SELECT songId, title, duration, coverUrl, singerId, genreId, views, createdAt
                 FROM Song ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(songId) {
    const sql = `SELECT * FROM Song WHERE songId = ?`;
    const [rows] = await pool.query(sql, [songId]);
    return rows[0] || null;
  },

  async increaseView(songId) {
    const sql = `UPDATE Song SET views = views + 1 WHERE songId = ?`;
    await pool.query(sql, [songId]);
    const [rows] = await pool.query(`SELECT views FROM Song WHERE songId = ?`, [songId]);
    return rows[0]?.views || 0;
  },

  async create(song) {
    const sql = `
      INSERT INTO Song (songId, title, duration, fileUrl, lyric, coverUrl, views, singerId, genreId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ];
    await pool.query(sql, values);
    return song.songId; // ULID
  },

  async update(songId, data) {
    const sql = `
      UPDATE Song
      SET title = ?, duration = ?, fileUrl = ?, lyric = ?, coverUrl = ?, singerId = ?, genreId = ?
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
      songId,
    ];
    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
  },

  async delete(songId) {
    const sql = `DELETE FROM Song WHERE songId = ?`;
    const [result] = await pool.query(sql, [songId]);
    return result.affectedRows > 0;
  },
};

module.exports = SongRepository;
