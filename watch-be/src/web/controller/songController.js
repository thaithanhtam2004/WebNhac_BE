const SongService = require("../../services/songService");
const cloudinary = require("../../utils/config/cloudinary");
const musicMetadata = require("music-metadata");

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


  // ✅ Hàm helper để chuẩn hóa ngày tháng
  static normalizeDate(dateString) {
    if (!dateString) return null;
    // Đảm bảo format YYYY-MM-DD và thêm thời gian 12:00:00 để tránh timezone issue
    const date = new Date(dateString + 'T12:00:00');
    return date.toISOString().split('T')[0];
  }

  // 🟢 Tạo bài hát mới (upload file & ảnh)
  async create(req, res) {
    try {
      console.log("📥 Request body:", req.body);
      console.log("📁 Files:", req.files);

      const { title, lyric, singerId, genreId, releaseDate } = req.body;

      // Validation đầy đủ
      if (!title?.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng nhập tên bài hát" 
        });
      }

      if (!singerId) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng chọn nghệ sĩ" 
        });
      }

      if (!genreId) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng chọn thể loại" 
        });
      }

      // Kiểm tra file nhạc bắt buộc
      if (!req.files?.file?.[0]) {
        return res.status(400).json({ 
          success: false, 
          message: "Vui lòng upload file nhạc" 
        });
      }


      let fileUrl = "";
      let coverUrl = "";

      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { resource_type: "video", folder: "songs" }
        );

        duration = Math.round(metadata.format.duration || 0);
        console.log(`⏱️ Duration: ${duration}s`);
      } catch (metaErr) {
        console.error("⚠️ Không thể đọc metadata:", metaErr.message);
      }


        // Tính duration từ file audio
        try {
          const metadata = await musicMetadata.parseBuffer(file.buffer, {
            mimeType: file.mimetype,
          });
          duration = Math.round(metadata.format.duration || 0);
        } catch (metaErr) {
          console.error("⚠️ Không thể đọc metadata:", metaErr.message);
        }
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

      // ✅ Chuẩn hóa releaseDate trước khi lưu
      const normalizedDate = SongController.normalizeDate(releaseDate);
      console.log("📅 Original date:", releaseDate);
      console.log("📅 Normalized date:", normalizedDate);

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

      res.status(201).json({
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

      const { title, lyric, singerId, genreId, releaseDate, popularityScore } = req.body;

      const songId = req.params.id;

      const existing = await SongService.getSongById(songId);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;
      let newDuration = duration || existing.duration;

      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = uploadRes.secure_url;

        try {
          const metadata = await musicMetadata.parseBuffer(file.buffer, {
            mimeType: file.mimetype,
          });
          newDuration = Math.round(metadata.format.duration || 0);
        } catch (metaErr) {
          console.error("⚠️ Không thể đọc metadata:", metaErr.message);
        }
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

      // ✅ Chuẩn hóa releaseDate nếu có cập nhật
      let finalReleaseDate = existing.releaseDate;
      if (releaseDate !== undefined && releaseDate !== null && releaseDate !== '') {
        finalReleaseDate = SongController.normalizeDate(releaseDate);
        console.log("📅 Updated date:", releaseDate, "=>", finalReleaseDate);
      }

      const result = await SongService.updateSong(songId, {
        title,
        duration: newDuration,
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,

        releaseDate: finalReleaseDate,
        popularityScore: popularityScore !== undefined ? popularityScore : existing.popularityScore,

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

  async getSongByReleaseDate(req, res) {
    try {
      const songs = await SongService.getSongByReleaseDate();
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

}

module.exports = new SongController();
