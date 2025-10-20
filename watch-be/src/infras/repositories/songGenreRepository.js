const pool = require("../db/connection").promise();

const SongGenreRepository = {
  // Thêm một thể loại cho bài hát
  async addGenreToSong(songId, genreId) {
    const sql = `
      INSERT INTO SongGenre (songId, genreId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE songId = songId
    `;
    const [result] = await pool.query(sql, [songId, genreId]);
    return result.affectedRows > 0;
  },

  // Xóa một thể loại khỏi bài hát
  async removeGenreFromSong(songId, genreId) {
    const sql = `DELETE FROM SongGenre WHERE songId = ? AND genreId = ?`;
    const [result] = await pool.query(sql, [songId, genreId]);
    return result.affectedRows > 0;
  },

  // Lấy danh sách thể loại của một bài hát
  async getGenresBySong(songId) {
    const sql = `
      SELECT g.genreId, g.name, g.description
      FROM SongGenre sg
      JOIN Genre g ON sg.genreId = g.genreId
      WHERE sg.songId = ?
    `;
    const [rows] = await pool.query(sql, [songId]);
    return rows;
  },

  // Lấy danh sách bài hát thuộc một thể loại
  async getSongsByGenre(genreId) {
    const sql = `
      SELECT s.songId, s.title, s.fileUrl, s.coverUrl, s.views, s.createdAt
      FROM SongGenre sg
      JOIN Song s ON sg.songId = s.songId
      WHERE sg.genreId = ?
      ORDER BY s.createdAt DESC
    `;
    const [rows] = await pool.query(sql, [genreId]);
    return rows;
  },

  // Cập nhật lại toàn bộ danh sách thể loại cho một bài hát
  // (thường dùng khi chỉnh sửa thông tin bài hát)
  async updateSongGenres(songId, genreIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa tất cả thể loại cũ
      await connection.query("DELETE FROM SongGenre WHERE songId = ?", [songId]);

      // Thêm danh sách thể loại mới
      for (const genreId of genreIds) {
        await connection.query(
          "INSERT INTO SongGenre (songId, genreId) VALUES (?, ?)",
          [songId, genreId]
        );
      }

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};

module.exports = SongGenreRepository;
