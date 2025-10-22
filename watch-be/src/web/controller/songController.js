const SongService = require("../../services/songService");
const cloudinary = require("../../utils/config/cloudinary");

class SongController {
  // 🟢 Lấy tất cả bài hát
  async getAll(req, res) {
    try {
      const songs = await SongService.getAllSongs();
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Lấy bài hát theo ID
  async getById(req, res) {
    try {
      const song = await SongService.getSongById(req.params.id);
      if (!song) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });
      }
      res.status(200).json({ success: true, data: song });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // 🟢 Tạo bài hát mới (upload file & ảnh)
  async create(req, res) {
    try {
      const { title, duration, lyric, singerId, genreId } = req.body;

      let fileUrl = "";
      let coverUrl = "";

      // 🆙 Upload nhạc (qua buffer)
      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          {
            resource_type: "video",
            folder: "songs",
          }
        );
        fileUrl = uploadRes.secure_url;
      }

      // 🆙 Upload ảnh bìa (qua buffer)
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64 = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64}`,
          {
            resource_type: "image",
            folder: "covers",
          }
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
      });

      res.status(201).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi tạo bài hát:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật bài hát (có thể thay file/ảnh mới)
  async update(req, res) {
    try {
      const { title, duration, lyric, singerId, genreId } = req.body;
      const songId = req.params.id;

      const existing = await SongService.getSongById(songId);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });
      }

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;

      // 🆙 Upload file mới nếu có
      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          {
            resource_type: "video",
            folder: "songs",
          }
        );
        fileUrl = uploadRes.secure_url;
      }

      // 🆙 Upload ảnh mới nếu có
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64 = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64}`,
          {
            resource_type: "image",
            folder: "covers",
          }
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
      });

      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      console.error("❌ Lỗi cập nhật:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🔴 Xóa bài hát
  async delete(req, res) {
    try {
      const result = await SongService.deleteSong(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 👁 Tăng lượt xem
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
