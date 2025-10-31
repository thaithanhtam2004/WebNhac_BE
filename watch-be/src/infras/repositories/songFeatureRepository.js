const pool = require('../db/connection').promise();

const SongFeatureRepository = {
  // Danh sách cột của bảng (trừ createdAt)
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

  // Tạo mới đặc trưng bài hát
  async create({ songId, features, emotionId = null }) {
    // Tạo mảng giá trị theo đúng thứ tự cột
    const params = this.columns.map(col => {
      if (col === 'songId') return songId;
      if (col === 'emotionId') return emotionId || null;
      return features[col] !== undefined ? features[col] : null;
    });

    // Tạo chuỗi dấu hỏi cho prepared statement
    const placeholders = this.columns.map(() => '?').join(',');

    const sql = `INSERT INTO SongFeature (${this.columns.join(',')}) VALUES (${placeholders})`;

    await pool.query(sql, params);

    return { songId, ...features, emotionId };
  },

  // Lấy đặc trưng theo songId
  async findBySongId(songId) {
    const sql = 'SELECT * FROM SongFeature WHERE songId = ?';
    const [rows] = await pool.query(sql, [songId]);
    return rows.length > 0 ? rows[0] : null;
  }
};

module.exports = SongFeatureRepository;
