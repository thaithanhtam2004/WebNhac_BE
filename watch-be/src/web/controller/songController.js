const SongService = require("../../services/songService");
const cloudinary = require("../../utils/config/cloudinary");
const musicMetadata = require("music-metadata");

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
      console.log("📥 Request body:", req.body);
      console.log("📁 Files:", req.files);

      const { title, lyric, singerId, genreId, releaseDate } = req.body; // ← Thêm releaseDate

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
      let duration = 0;

      // 🎵 Tính duration từ file audio
      const audioFile = req.files.file[0];
      try {
        const metadata = await musicMetadata.parseBuffer(
          audioFile.buffer,
          { mimeType: audioFile.mimetype }
        );
        duration = Math.round(metadata.format.duration || 0);
        console.log(`⏱️ Duration: ${duration}s`);
      } catch (metaErr) {
        console.error("⚠️ Không thể đọc metadata:", metaErr.message);
        // Vẫn tiếp tục, duration = 0
      }

      // 🆙 Upload nhạc lên Cloudinary
      const base64Audio = audioFile.buffer.toString("base64");
      const uploadRes = await cloudinary.uploader.upload(
        `data:${audioFile.mimetype};base64,${base64Audio}`,
        {
          resource_type: "video",
          folder: "songs",
        }
      );
      fileUrl = uploadRes.secure_url;

      // 🆙 Upload ảnh bìa (nếu có)
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64Cover = cover.buffer.toString("base64");
        const uploadCoverRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64Cover}`,
          {
            resource_type: "image",
            folder: "covers",
          }
        );
        coverUrl = uploadCoverRes.secure_url;
      }

      const result = await SongService.createSong({
        title,
        duration,
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate: releaseDate || null, // ← Thêm releaseDate
      });

      res.status(201).json({ 
        success: true, 
        message: result.message,
        songId: result.songId 
      });
    } catch (err) {
      console.error("❌ Lỗi tạo bài hát:", err);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật bài hát (có thể thay file/ảnh mới)
  async update(req, res) {
    try {
      const { title, lyric, singerId, genreId, releaseDate, popularityScore } = req.body; // ← Thêm 2 field
      const songId = req.params.id;

      const existing = await SongService.getSongById(songId);
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });
      }

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;
      let duration = existing.duration;

      // 🆙 Upload file mới nếu có
      if (req.files?.file?.[0]) {
        const audioFile = req.files.file[0];

        // Tính duration mới
        try {
          const metadata = await musicMetadata.parseBuffer(
            audioFile.buffer,
            { mimeType: audioFile.mimetype }
          );
          duration = Math.round(metadata.format.duration || 0);
          console.log(`⏱️ Duration mới: ${duration}s`);
        } catch (metaErr) {
          console.error("⚠️ Không thể đọc metadata:", metaErr.message);
        }

        const base64Audio = audioFile.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${audioFile.mimetype};base64,${base64Audio}`,
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
        const base64Cover = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64Cover}`,
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
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,
        releaseDate: releaseDate !== undefined ? releaseDate : existing.releaseDate, // ← Giữ nguyên nếu không cập nhật
        popularityScore: popularityScore !== undefined ? popularityScore : existing.popularityScore, // ← Giữ nguyên nếu không cập nhật
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