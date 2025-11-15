const pool = require('../db/connection').promise();

const SongFeatureRepository = {
  columns: [
    'songId', 'tempo', 'totalBeats', 'averageBeats',
    'chromaStftMean','chromaStftStd','chromaStftVar',
    'chromaCqMean','chromaCqStd','chromaCqVar',
    'chromaCensMean','chromaCensStd','chromaCensVar',
    'mfccMean','mfccStd','mfccVar',
    'mfccDeltaMean','mfccDeltaStd','mfccDeltaVar',
    'rmseMean','rmseStd','rmseVar',
    'centMean','centStd','centVar',
    'specBwMean','specBwStd','specBwVar',
    'contrastMean','contrastStd','contrastVar',
    'rolloffMean','rolloffStd','rolloffVar',
    'tonnetzMean','tonnetzStd','tonnetzVar',
    'zcrMean','zcrStd','zcrVar',
    'harmMean','harmStd','harmVar',
    'percMean','percStd','percVar',
    'frameMean','frameStd','frameVar',
    'emotionId'
  ],

  async create({ songId, features, emotionId = null }) {
    const params = this.columns.map(col => {
      if (col === 'songId') return songId;
      if (col === 'emotionId') return emotionId || null;
      return features[col] !== undefined ? features[col] : null;
    });

    const placeholders = this.columns.map(() => '?').join(',');
    const sql = `INSERT INTO SongFeature (${this.columns.join(',')}) VALUES (${placeholders})`;
    await pool.query(sql, params);
    return { songId, ...features, emotionId };
  },

  async findBySongId(songId) {
    const sql = 'SELECT * FROM SongFeature WHERE songId = ?';
    const [rows] = await pool.query(sql, [songId]);
    return rows.length > 0 ? rows[0] : null;
  },

  async updateEmotionBySong(songId, emotionValue) {
    const sql = `UPDATE SongFeature SET emotionId = ? WHERE songId = ?`;
    await pool.query(sql, [emotionValue, songId]);
    return { songId, emotionId: emotionValue };
  },
};

module.exports = SongFeatureRepository;
