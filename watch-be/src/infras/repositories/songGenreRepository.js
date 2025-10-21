const pool = require("../db/connection").promise();

const SongGenreRepository = {
  // Thêm một thể loại cho bài hát
  async addGenreToSong(songId, genreId) {
    // Kiểm tra Song tồn tại
    const [songRows] = await pool.query("SELECT 1 FROM Song WHERE songId = ?", [songId]);
    if (songRows.length === 0) throw new Error(`Song ${songId} không tồn tại`);

    // Kiểm tra Genre tồn tại
    const [genreRows] = await pool.query("SELECT 1 FROM Genre WHERE genreId = ?", [genreId]);
    if (genreRows.length === 0) throw new Error(`Genre ${genreId} không tồn tại`);

    // Thêm thể loại, nếu trùng thì không lỗi
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
    const sql = "DELETE FROM SongGenre WHERE songId = ? AND genreId = ?";
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

  // Lấy danh sách bài hát theo thể loại
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

  // Cập nhật toàn bộ danh sách thể loại cho một bài hát
  async updateSongGenres(songId, genreIds) {
    // Kiểm tra Song tồn tại
    const [songRows] = await pool.query("SELECT 1 FROM Song WHERE songId = ?", [songId]);
    if (songRows.length === 0) throw new Error(`Song ${songId} không tồn tại`);

    // Kiểm tra tất cả Genre tồn tại
    if (genreIds.length > 0) {
      const placeholders = genreIds.map(() => "?").join(",");
      const [genreRows] = await pool.query(
        `SELECT genreId FROM Genre WHERE genreId IN (${placeholders})`,
        genreIds
      );
      const existingGenreIds = genreRows.map(row => row.genreId);
      const invalidGenres = genreIds.filter(id => !existingGenreIds.includes(id));
      if (invalidGenres.length > 0) throw new Error(`Genre(s) không tồn tại: ${invalidGenres.join(", ")}`);
    }

    // Transaction để xóa và thêm lại toàn bộ thể loại
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query("DELETE FROM SongGenre WHERE songId = ?", [songId]);

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
