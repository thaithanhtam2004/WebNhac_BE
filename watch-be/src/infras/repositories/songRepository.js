const pool = require("../db/connection").promise();

const SongRepository = {
  // 🟢 Lấy tất cả bài hát (kèm tên ca sĩ và thể loại)
  async findAll() {
    const sql = `
      SELECT 
        s.songId,
        s.title,
        s.duration,
        s.coverUrl,
        s.fileUrl,
        s.lyric,
        s.views,
        s.releaseDate,
        s.popularityScore,
        s.createdAt,
        si.singerId,
        si.name AS singerName,
        g.genreId,
        g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      ORDER BY s.createdAt DESC
    `;
    const [rows] = await pool.query(sql);
    return rows;
  },

  // 🟢 Lấy chi tiết 1 bài hát (kèm tên ca sĩ + thể loại)
  async findById(songId) {
    const sql = `
      SELECT 
        s.*,
        si.name AS singerName,
        g.name AS genreName
      FROM Song s
      LEFT JOIN Singer si ON s.singerId = si.singerId
      LEFT JOIN Genre g ON s.genreId = g.genreId
      WHERE s.songId = ?
    `;
    const [rows] = await pool.query(sql, [songId]);
    const song = rows[0] || null;
    
    // 🔍 Debug: Kiểm tra lyric có được trả về không
    if (song) {
      console.log("🎵 Song found:", song.songId);
      console.log("📝 Lyric from DB:", song.lyric ? "Có lời bài hát" : "Không có lời");
    }
    
    return song;
  },

  // 🟢 Tăng lượt xem
  async increaseView(songId) {
    const sql = `UPDATE Song SET views = views + 1 WHERE songId = ?`;
    await pool.query(sql, [songId]);
    const [rows] = await pool.query(`SELECT views FROM Song WHERE songId = ?`, [songId]);
    return rows[0]?.views || 0;
  },

  // 🟢 Tạo bài hát mới
  async create(song) {
    console.log("🔍 Repository nhận được song:", song);
    console.log("📝 Lyric value:", song.lyric);
    
    const sql = `
      INSERT INTO Song (
        songId, title, duration, fileUrl, lyric, coverUrl, 
        views, singerId, genreId, releaseDate, popularityScore
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      song.songId,
      song.title,
      song.duration,
      song.fileUrl,
      song.lyric || null,  // ✅ Đảm bảo lyric được truyền vào, null nếu rỗng
      song.coverUrl,
      song.views || 0,
      song.singerId,
      song.genreId,
      song.releaseDate || null,
      song.popularityScore || 0,
    ];
    
    console.log("📤 Values sẽ insert:", values);
    
    const [result] = await pool.query(sql, values);
    console.log("✅ Insert result:", result);
    
    return song.songId;
  },

  // 🟢 Cập nhật bài hát
  async update(songId, data) {
    console.log("🔍 Repository nhận được data:", data);
    console.log("📝 Lyric value:", data.lyric);
    
    const sql = `
      UPDATE Song
      SET title = ?, duration = ?, fileUrl = ?, lyric = ?, coverUrl = ?, 
          singerId = ?, genreId = ?, releaseDate = ?, popularityScore = ?
      WHERE songId = ?
    `;
    
    const values = [
      data.title,
      data.duration,
      data.fileUrl,
      data.lyric || null,  // ✅ Đảm bảo lyric được truyền vào
      data.coverUrl,
      data.singerId,
      data.genreId,
      data.releaseDate || null,
      data.popularityScore !== undefined ? data.popularityScore : 0,
      songId,
    ];
    
    console.log("📤 Values sẽ update:", values);
    
    const [result] = await pool.query(sql, values);
    console.log("✅ Update result:", result);
    
    return result.affectedRows > 0;
  },

  // 🔴 Xóa bài hát
  async delete(songId) {
    const sql = `DELETE FROM Song WHERE songId = ?`;
    const [result] = await pool.query(sql, [songId]);
    return result.affectedRows > 0;
  },

async findByReleaseDateDesc() {
  const sql = `
    SELECT 
      s.songId,
      s.title,
      s.duration,
      s.coverUrl,
      s.fileUrl,
      s.views,
      s.releaseDate,
      s.popularityScore,
      si.singerId,
      si.name AS singerName,
      g.genreId,
      g.name AS genreName
    FROM Song s
    LEFT JOIN Singer si ON s.singerId = si.singerId
    LEFT JOIN Genre g ON s.genreId = g.genreId
    ORDER BY s.releaseDate DESC
  `;
  
  const [rows] = await pool.query(sql);
  return rows; // trả trực tiếp
},

async findAllWithFeature() {
  const sql = `
    SELECT 
      s.songId,
      s.title,
      s.duration,
      s.coverUrl,
      s.fileUrl,
      s.lyric,
      s.views,
      s.releaseDate,
      s.popularityScore,
      s.createdAt,
      si.singerId,
      si.name AS singerName,
      g.genreId,
      g.name AS genreName,
      CASE WHEN sf.songId IS NOT NULL THEN 1 ELSE 0 END AS hasFeature
    FROM Song s
    LEFT JOIN Singer si ON s.singerId = si.singerId
    LEFT JOIN Genre g ON s.genreId = g.genreId
    LEFT JOIN SongFeature sf ON s.songId = sf.songId
    ORDER BY s.createdAt DESC
  `;
  const [rows] = await pool.query(sql);
  return rows;
},


};



module.exports = SongRepository;