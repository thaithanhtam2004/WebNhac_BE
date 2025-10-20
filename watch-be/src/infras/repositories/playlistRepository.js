const pool = require('../db/connection').promise();

const PlaylistRepository = {
  async findByUser(userId) {
    const sql = `SELECT * FROM Playlist WHERE userId = ? ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql, [userId]);
    return rows;
  },

  async findAll() {
    const sql = `SELECT * FROM Playlist ORDER BY createdAt DESC`;
    const [rows] = await pool.query(sql);
    return rows;
  },

  async findById(playlistId) {
    const sql = `SELECT * FROM Playlist WHERE playlistId = ?`;
    const [rows] = await pool.query(sql, [playlistId]);
    return rows.length > 0 ? rows[0] : null;
  },

  async create({ playlistId, name, userId }) {
    const sql = `INSERT INTO Playlist (playlistId, name, userId) VALUES (?, ?, ?)`;
    await pool.query(sql, [playlistId, name, userId]);
  },

  async update(playlistId, name) {
    const sql = `UPDATE Playlist SET name = ? WHERE playlistId = ?`;
    await pool.query(sql, [name, playlistId]);
  },

  async delete(playlistId) {
    const sql = `DELETE FROM Playlist WHERE playlistId = ?`;
    await pool.query(sql, [playlistId]);
  }
};

module.exports = PlaylistRepository;
