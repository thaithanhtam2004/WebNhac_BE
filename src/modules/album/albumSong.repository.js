const pool = require("../../config/database").promise();

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

  // 🟢 Thêm 1 bài hát vào album (Tự động tính trackNumber tiếp theo)
  async addSongToAlbum(albumId, songId, trackNumber = null) {
    // Nếu không truyền trackNumber, dùng subquery để lấy MAX(trackNumber) + 1
    // Sử dụng alias 'temp' để tránh lỗi "You can't specify target table for update in FROM clause"
    const sql = `
      INSERT INTO AlbumSong (albumId, songId, trackNumber)
      VALUES (?, ?, COALESCE(?, (SELECT COALESCE(MAX(trackNumber), 0) + 1 FROM AlbumSong AS temp WHERE albumId = ?)))
      ON DUPLICATE KEY UPDATE trackNumber = VALUES(trackNumber)
    `;
    
    // Tham số: albumId, songId, trackNumber (nếu có), albumId (cho subquery)
    const [result] = await pool.query(sql, [albumId, songId, trackNumber, albumId]);
    return result.affectedRows > 0;
  },

  // 🟢 Thêm nhiều bài hát (Transaction + Tự động tính trackNumber nối tiếp)
  async addMultipleSongsToAlbum(albumId, songIds) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Lấy trackNumber lớn nhất hiện tại trong album đó
      const [rows] = await connection.query(
        `SELECT MAX(trackNumber) as maxTrack FROM AlbumSong WHERE albumId = ?`, 
        [albumId]
      );
      
      // Bắt đầu đếm từ số tiếp theo (Ví dụ max là 5 thì bắt đầu từ 6)
      let currentTrack = (rows[0]?.maxTrack || 0) + 1;

      const insertSql = `
        INSERT INTO AlbumSong (albumId, songId, trackNumber)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE trackNumber = VALUES(trackNumber)
      `;

      // 2. Chèn từng bài hát với trackNumber tăng dần
      for (const songId of songIds) {
        await connection.query(insertSql, [albumId, songId, currentTrack]);
        currentTrack++; // Tăng số thứ tự
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("❌ addMultipleSongsToAlbum Transaction Error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },

  // 🔴 Xóa bài hát khỏi album
  async removeSongFromAlbum(albumId, songId) {
    const sql = `DELETE FROM AlbumSong WHERE albumId = ? AND songId = ?`;
    const [result] = await pool.query(sql, [albumId, songId]);
    return result.affectedRows > 0;
  },

  // 🟡 Cập nhật lại toàn bộ danh sách (Dùng cho tính năng Reorder/Sắp xếp lại)
  async updateAlbumSongs(albumId, songs = []) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Xóa toàn bộ liên kết cũ
      await connection.query(`DELETE FROM AlbumSong WHERE albumId = ?`, [albumId]);

      // 2. Thêm lại danh sách mới với thứ tự mới
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
      console.error("❌ updateAlbumSongs Transaction Error:", error);
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = AlbumSongRepository;