const PlaylistRepository = require("./playlistRepository");
const pool = require("../db/connection").promise();

const PlaylistSongRepository = {
  // Thêm 1 bài hát vào playlist
  async addSong(playlistId, songId) {
    // Kiểm tra playlist tồn tại
    const playlist = await PlaylistRepository.findById(playlistId);
    if (!playlist) throw new Error("Playlist không tồn tại");

    // Kiểm tra song tồn tại
    const [songRows] = await pool.query("SELECT 1 FROM Song WHERE songId = ?", [songId]);
    if (!songRows.length) throw new Error("Bài hát không tồn tại");

    // Kiểm tra song đã có trong playlist chưa
    const [existingRows] = await pool.query(
      "SELECT 1 FROM PlaylistSong WHERE playlistId = ? AND songId = ?",
      [playlistId, songId]
    );
    if (existingRows.length) {
      return { message: "Bài hát đã có trong playlist" };
    }

    // Thêm vào playlist
    const sql = "INSERT INTO PlaylistSong (playlistId, songId) VALUES (?, ?)";
    await pool.query(sql, [playlistId, songId]);

    return { message: "Thêm bài hát thành công" };
  },

  // Xóa 1 bài hát khỏi playlist
  async removeSong(playlistId, songId) {
    const sql = "DELETE FROM PlaylistSong WHERE playlistId = ? AND songId = ?";
    const [result] = await pool.query(sql, [playlistId, songId]);
    
    if (result.affectedRows === 0) {
      return { message: "Bài hát không tồn tại trong playlist" };
    }

    return { message: "Xóa bài hát thành công" };
  },

  // Lấy danh sách bài hát trong playlist
  async findSongsByPlaylist(playlistId) {
    const sql = `
      SELECT s.*
      FROM Song s
      JOIN PlaylistSong ps ON s.songId = ps.songId
      WHERE ps.playlistId = ?
    `;
    const [rows] = await pool.query(sql, [playlistId]);
    return rows;
  },

  // Thêm nhiều bài hát cùng lúc (transaction)
  async addSongsBulk(playlistId, songIds = []) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const playlist = await PlaylistRepository.findById(playlistId);
      if (!playlist) throw new Error("Playlist không tồn tại");

      for (const songId of songIds) {
        const [songRows] = await conn.query("SELECT 1 FROM Song WHERE songId = ?", [songId]);
        if (!songRows.length) continue; // bỏ qua nếu song không tồn tại

        const [existingRows] = await conn.query(
          "SELECT 1 FROM PlaylistSong WHERE playlistId = ? AND songId = ?",
          [playlistId, songId]
        );
        if (!existingRows.length) {
          await conn.query("INSERT INTO PlaylistSong (playlistId, songId) VALUES (?, ?)", [playlistId, songId]);
        }
      }

      await conn.commit();
      return { message: "Thêm bài hát thành công" };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },
};

module.exports = PlaylistSongRepository;
