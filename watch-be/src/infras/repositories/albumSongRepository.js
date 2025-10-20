const pool = require("../db/connection").promise();

const AlbumSongRepository = {
  // Thêm một bài hát vào album
  async addSongToAlbum(albumId, songId, trackNumber = null) {
    const sql = `
      INSERT INTO AlbumSong (albumId, songId, trackNumber)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE trackNumber = VALUES(trackNumber)
    `;
    const [result] = await pool.query(sql, [albumId, songId, trackNumber]);
    return result.affectedRows > 0;
  },

  // Xóa một bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    const sql = `DELETE FROM AlbumSong WHERE albumId = ? AND songId = ?`;
    const [result] = await pool.query(sql, [albumId, songId]);
    return result.affectedRows > 0;
  },

  // Lấy danh sách bài hát trong một album, sắp xếp theo trackNumber
  async getSongsByAlbum(albumId) {
    const sql = `
      SELECT s.songId, s.title, s.fileUrl, s.coverUrl, s.duration, s.views, s.createdAt, aS.trackNumber
      FROM AlbumSong aS
      JOIN Song s ON aS.songId = s.songId
      WHERE aS.albumId = ?
      ORDER BY aS.trackNumber ASC
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows;
  },

  // Cập nhật toàn bộ danh sách bài hát cho album
  async updateAlbumSongs(albumId, songs) {
    // songs = [{ songId, trackNumber }, ...]
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa tất cả bài hát cũ
      await connection.query("DELETE FROM AlbumSong WHERE albumId = ?", [albumId]);

      // Thêm lại danh sách bài hát mới
      for (const { songId, trackNumber } of songs) {
        await connection.query(
          "INSERT INTO AlbumSong (albumId, songId, trackNumber) VALUES (?, ?, ?)",
          [albumId, songId, trackNumber || null]
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

module.exports = AlbumSongRepository;
