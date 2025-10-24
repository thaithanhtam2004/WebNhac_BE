const pool = require("../db/connection").promise();

const AlbumSongRepository = {
  // 🟢 Lấy danh sách bài hát trong album
  async getSongsByAlbum(albumId) {
    const sql = `
      SELECT 
        s.songId,
        s.title,
        s.coverUrl,
        s.fileUrl,
        s.duration,
        s.views,
        s.releaseDate,
        s.createdAt,
        aS.trackNumber
      FROM AlbumSong aS
      JOIN Song s ON aS.songId = s.songId
      WHERE aS.albumId = ?
      ORDER BY aS.trackNumber ASC
    `;
    const [rows] = await pool.query(sql, [albumId]);
    return rows;
  },

  // 🟢 Thêm bài hát vào album
  async addSongToAlbum(albumId, songId, trackNumber = null) {
    const sql = `
      INSERT INTO AlbumSong (albumId, songId, trackNumber)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE trackNumber = VALUES(trackNumber)
    `;
    const [result] = await pool.query(sql, [albumId, songId, trackNumber]);
    return result.affectedRows > 0;
  },

  // 🟢 Xóa bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    const sql = `DELETE FROM AlbumSong WHERE albumId = ? AND songId = ?`;
    const [result] = await pool.query(sql, [albumId, songId]);
    return result.affectedRows > 0;
  },

  // 🟢 Cập nhật toàn bộ danh sách bài hát trong album
  async updateAlbumSongs(albumId, songs = []) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Xóa toàn bộ danh sách cũ
      await connection.query(`DELETE FROM AlbumSong WHERE albumId = ?`, [albumId]);

      // Nếu có danh sách bài hát mới
      for (const { songId, trackNumber } of songs) {
        await connection.query(
          `INSERT INTO AlbumSong (albumId, songId, trackNumber) VALUES (?, ?, ?)`,
          [albumId, songId, trackNumber || null]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("❌ updateAlbumSongs error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = AlbumSongRepository;
