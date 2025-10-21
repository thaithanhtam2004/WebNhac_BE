const pool = require('../db/connection').promise();

const SongFeatureRepository = {
  // Lưu đặc trưng bài hát vào DB
  async create(songId, features) {
 const sql = `
  INSERT INTO SongFeature 
  (songId, tempoBpm, loudnessDb, energy, instrumentalness, danceability, speechiness, acousticness)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

    const params = [
      songId,
      features.tempo_bpm,
      features.loudness_db,
      features.energy,
      features.instrumentalness,
      features.danceability,
      features.speechiness,
      features.acousticness
    ];

    const [result] = await pool.query(sql, params);
    return { featureId: result.insertId, songId, ...features };
  },

  // Lấy đặc trưng theo songId
  async findBySongId(songId) {
    const sql = 'SELECT * FROM SongFeature WHERE songId = ?';
    const [rows] = await pool.query(sql, [songId]);
    return rows.length > 0 ? rows[0] : null;
  }
};

module.exports = SongFeatureRepository;
