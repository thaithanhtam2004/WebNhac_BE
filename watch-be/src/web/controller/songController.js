const SongService = require("../../services/songService");
const cloudinary = require("../../utils/config/cloudinary");
const musicMetadata = require("music-metadata");

class SongController {
  // ✅ Helper chuẩn hóa ngày
  static normalizeDate(dateString) {
    if (!dateString) return null;
    // Xử lý cả dạng dd/mm/yyyy nếu cần, ở đây giả định yyyy-mm-dd
    if (dateString.includes('/')) {
        const [d, m, y] = dateString.split('/');
        return `${y}-${m}-${d}`;
    }
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }

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

  // 🟢 Tạo bài hát mới
  async create(req, res) {
    try {
      const { title, lyric, singerId, genreId, releaseDate } = req.body;

      // Validate cơ bản ở Controller
      if (!req.files?.file?.[0]) {
        return res.status(400).json({ success: false, message: "Vui lòng upload file nhạc" });
      }

      let fileUrl = "";
      let coverUrl = "";
      let duration = 0;

      // 1. Xử lý File Nhạc
      const audioFile = req.files.file[0];
      try {
        const metadata = await musicMetadata.parseBuffer(audioFile.buffer, { mimeType: audioFile.mimetype });
        duration = Math.round(metadata.format.duration || 0);
      } catch (err) {
        console.warn("⚠️ Không đọc được metadata:", err.message);
      }

      const base64Audio = audioFile.buffer.toString("base64");
      const audioUpload = await cloudinary.uploader.upload(
        `data:${audioFile.mimetype};base64,${base64Audio}`,
        { resource_type: "video", folder: "songs" }
      );
      fileUrl = audioUpload.secure_url;

      // 2. Xử lý Ảnh bìa (nếu có)
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64Cover = cover.buffer.toString("base64");
        const coverUpload = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64Cover}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = coverUpload.secure_url;
      }

      const normalizedDate = SongController.normalizeDate(releaseDate);

      // 3. Gọi Service để lưu DB
      const result = await SongService.createSong({
        title,
        duration,
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate: normalizedDate,
      });

      res.status(201).json({ success: true, message: result.message, songId: result.songId });

    } catch (err) {
      console.error("❌ Lỗi tạo bài hát:", err);
      // Lưu ý: Nếu lỗi xảy ra ở đây (vd: trùng tên), file đã upload lên Cloudinary vẫn tồn tại.
      // Cần cơ chế xóa file rác sau này.
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật bài hát
  async update(req, res) {
    try {
      const { title, lyric, singerId, genreId, releaseDate, popularityScore } = req.body;
      const songId = req.params.id;

      // Lấy thông tin cũ để giữ lại nếu không upload mới
      const existing = await SongService.getSongById(songId);

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;
      let duration = existing.duration;

      // Check upload nhạc mới
      if (req.files?.file?.[0]) {
        const audioFile = req.files.file[0];
        try {
          const metadata = await musicMetadata.parseBuffer(audioFile.buffer, { mimeType: audioFile.mimetype });
          duration = Math.round(metadata.format.duration || 0);
        } catch (e) {}

        const base64Audio = audioFile.buffer.toString("base64");
        const upload = await cloudinary.uploader.upload(
          `data:${audioFile.mimetype};base64,${base64Audio}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = upload.secure_url;
      }

      // Check upload ảnh mới
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64Cover = cover.buffer.toString("base64");
        const upload = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64Cover}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = upload.secure_url;
      }

      const finalReleaseDate = releaseDate ? SongController.normalizeDate(releaseDate) : existing.releaseDate;

      const result = await SongService.updateSong(songId, {
        title,
        duration,
        lyric,
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate: finalReleaseDate,
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

  // Các hàm phụ (Increase View, Search, GetBy...) giữ nguyên logic gọi Service
  async increaseView(req, res) {
    try {
        const result = await SongService.increaseView(req.params.id);
        res.status(200).json({ success: true, message: result.message });
    } catch (err) { res.status(400).json({ success: false, message: err.message }); }
  }

  async getSongByReleaseDate(req, res) {
    try {
        const songs = await SongService.getSongByReleaseDate();
        res.status(200).json({ success: true, data: songs });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }

  async searchSongs(req, res) {
    try {
        const result = await SongService.searchSongs(req.query.q);
        res.status(200).json(result);
    } catch (error) { res.status(500).json({success: false, message: error.message}); }
  }

  async searchAll(req, res) {
    try {
        const result = await SongService.searchAll(req.query.q);
        res.status(200).json(result);
    } catch (error) { res.status(500).json({success: false, message: error.message}); }
  }

  async getBySinger(req, res) {
     try {
         const songs = await SongService.getSongsBySinger(req.params.singerId);
         res.status(200).json({ success: true, data: songs });
     } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }

  async getByGenre(req, res) {
     try {
         const songs = await SongService.getSongsByGenre(req.params.genreId);
         res.status(200).json({ success: true, data: songs });
     } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }

  async getAllWithFeature(req, res) {
    try {
        const songs = await SongService.getAllSongsWithFeature();
        res.status(200).json({ success: true, data: songs });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }

  async getHotTrend(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const result = await SongService.getHotTrend(limit);
        res.status(200).json(result);
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
  }
}

module.exports = new SongController();