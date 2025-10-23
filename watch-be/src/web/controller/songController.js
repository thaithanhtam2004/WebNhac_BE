const SongService = require("../../services/songService");
const cloudinary = require("../../utils/config/cloudinary");

class SongController {
  async getAll(req, res) {
    try {
      const songs = await SongService.getAllSongs();
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const song = await SongService.getSongById(req.params.id);
      res.status(200).json({ success: true, data: song });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const {
        title,
        duration,
        lyric,
        singerId,
        genreId,
        releaseDate,
        popularityScore,
      } = req.body;

      let fileUrl = "";
      let coverUrl = "";

      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = uploadRes.secure_url;
      }

      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64 = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = uploadRes.secure_url;
      }

      const result = await SongService.createSong({
        title,
        duration,
        lyric,
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate: releaseDate || null,
        popularityScore: popularityScore || 0,
      });

      res
        .status(201)
        .json({
          success: true,
          message: result.message,
          songId: result.songId,
        });
    } catch (err) {
      console.error("❌ Lỗi tạo bài hát:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const {
        title,
        duration,
        lyric,
        singerId,
        genreId,
        releaseDate,
        popularityScore,
      } = req.body;
      const songId = req.params.id;

      const existing = await SongService.getSongById(songId);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;

      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = uploadRes.secure_url;
      }

      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64 = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = uploadRes.secure_url;
      }

      const result = await SongService.updateSong(songId, {
        title,
        duration,
        lyric,
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate,
        popularityScore,
      });

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await SongService.deleteSong(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async increaseView(req, res) {
    try {
      const songId = req.params.id;
      const result = await SongService.increaseView(songId);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SongController();
