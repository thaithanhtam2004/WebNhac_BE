const AlbumSongService = require("./albumSong.service");

class AlbumSongController {
  // 🟢 GET: Lấy danh sách bài hát trong album
  // Route: GET /api/albums/:albumId/songs
  async getSongsByAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const songs = await AlbumSongService.getSongsByAlbum(albumId);
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      console.error("❌ Error fetching album songs:", err);
      // Nếu lỗi là "Album không tồn tại" -> 404, còn lại 400
      const status = err.message.includes("không tồn tại") ? 404 : 400;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  // 🟢 POST: Thêm 1 bài hát vào album
  // Route: POST /api/albums/:albumId/songs/:songId
  async addSongToAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;

      if (!albumId || !songId) {
        return res.status(400).json({ success: false, message: "Thiếu albumId hoặc songId" });
      }

      const result = await AlbumSongService.addSongToAlbum(albumId, songId);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      console.error("❌ Error adding song to album:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟢 POST: Thêm NHIỀU bài hát vào album
  // Route: POST /api/albums/:albumId/songs
  // Body: { songIds: ["id1", "id2"] }
  async addMultipleSongsToAlbum(req, res) {
    try {
      const { albumId } = req.params;
      const { songIds } = req.body;

      if (!songIds || !Array.isArray(songIds)) {
        return res.status(400).json({ success: false, message: "Danh sách bài hát không hợp lệ" });
      }

      const result = await AlbumSongService.addMultipleSongsToAlbum(albumId, songIds);
      res.status(201).json({ success: true, ...result });
    } catch (err) {
      console.error("❌ Error adding multiple songs:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🔴 DELETE: Xóa bài hát khỏi album
  // Route: DELETE /api/albums/:albumId/songs/:songId
  async removeSongFromAlbum(req, res) {
    try {
      const { albumId, songId } = req.params;
      const result = await AlbumSongService.removeSongFromAlbum(albumId, songId);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error("❌ Error removing song from album:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 PUT: Cập nhật lại toàn bộ danh sách (Sắp xếp lại)
  // Route: PUT /api/albums/:albumId/songs
  async updateAlbumSongs(req, res) {
    try {
      const { albumId } = req.params;
      const { songIds } = req.body; // Mảng ID bài hát theo thứ tự mới

      if (!albumId) return res.status(400).json({ success: false, message: "Thiếu albumId" });

      const result = await AlbumSongService.updateAlbumSongs(albumId, songIds);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.error("❌ Error updating album songs:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new AlbumSongController();