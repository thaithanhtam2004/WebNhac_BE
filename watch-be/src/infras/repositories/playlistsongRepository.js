const pool = require("../db/connection").promise();

const PlaylistSongRepository = {
  async addSong(playlistId, songId) {
    const sql = `INSERT IGNORE INTO PlaylistSong (playlistId, songId) VALUES (?, ?)`;
    await pool.query(sql, [playlistId, songId]);
  },

  async removeSong(playlistId, songId) {
    const sql = `DELETE FROM PlaylistSong WHERE playlistId = ? AND songId = ?`;
    await pool.query(sql, [playlistId, songId]);
  },

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
};

module.exports = PlaylistSongRepository;
