const pool = require("../db/connection").promise();

const AlbumSongRepository = {
  // 🟢 Lấy danh sách bài hát trong album - FIXED SQL (đổi alias aS -> als)
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
        als.trackNumber,
        si.singerId,
        si.name as singerName
      FROM AlbumSong als
      JOIN Song s ON als.songId = s.songId
      LEFT JOIN Singer si ON s.singerId = si.singerId
      WHERE als.albumId = ?
      ORDER BY als.trackNumber ASC
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

  // 🆕 Thêm nhiều bài hát vào album
  async addMultipleSongsToAlbum(albumId, songIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertSql = `
        INSERT INTO AlbumSong (albumId, songId, trackNumber)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE trackNumber = VALUES(trackNumber)
      `;

      for (let i = 0; i < songIds.length; i++) {
        await connection.query(insertSql, [albumId, songIds[i], null]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("❌ addMultipleSongsToAlbum error:", error);
      throw error;
    } finally {
      connection.release();
    }
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

      // Xóa danh sách cũ
      await connection.query(`DELETE FROM AlbumSong WHERE albumId = ?`, [albumId]);

      // Thêm mới danh sách bài hát
      if (songs.length > 0) {
        const insertSql = `INSERT INTO AlbumSong (albumId, songId, trackNumber) VALUES (?, ?, ?)`;
        for (const { songId, trackNumber } of songs) {
          await connection.query(insertSql, [albumId, songId, trackNumber || null]);
        }
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