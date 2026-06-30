const SongService = require("./song.service");
const cloudinary = require("../../config/cloudinary");
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

  // 🧹 Helper xóa file trên Cloudinary khi gặp sự cố
  static async deleteFromCloudinary(publicId, resourceType = "image") {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      console.log(`🧹 Đã dọn dẹp file thành công trên Cloudinary: ${publicId} (${resourceType})`);
    } catch (err) {
      console.error(`⚠️ Lỗi dọn dẹp file Cloudinary (${publicId}):`, err.message);
    }
  }

  async getAll(req, res) {
    try {
      // Nếu có query params phân trang -> dùng findWithFilters
      const { page, limit, search, genreId, singerId, sortBy, sortOrder, order, visibility } = req.query;
      if (page || limit || search || genreId || singerId || visibility) {
        const result = await SongService.getAllSongsPaginated({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          search: search || "",
          genreId: genreId || "",
          singerId: singerId || "",
          sortBy: sortBy || "createdAt",
          sortOrder: order || sortOrder || "desc",   // ✅ FE gửi `order`, BE nhận đúng
          visibility: visibility || "all",
        });
        return res.status(200).json({
          success: true,
          data: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
          },
        });
      }
      // Không có params -> trả về toàn bộ (backward compat)
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
      let uploadedAudioPublicId = null;
      let uploadedCoverPublicId = null;

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
      uploadedAudioPublicId = audioUpload.public_id;

      // 2. Xử lý Ảnh bìa (nếu có)
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const base64Cover = cover.buffer.toString("base64");
        const coverUpload = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${base64Cover}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = coverUpload.secure_url;
        uploadedCoverPublicId = coverUpload.public_id;
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
      // Dọn dẹp các file đã upload lên Cloudinary nếu DB lưu thất bại
      if (uploadedAudioPublicId) {
        await SongController.deleteFromCloudinary(uploadedAudioPublicId, "video");
      }
      if (uploadedCoverPublicId) {
        await SongController.deleteFromCloudinary(uploadedCoverPublicId, "image");
      }
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // 🟡 Cập nhật bài hát
  async update(req, res) {
    let uploadedAudioPublicId = null;
    let uploadedCoverPublicId = null;
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
        uploadedAudioPublicId = upload.public_id;
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
        uploadedCoverPublicId = upload.public_id;
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
      // Dọn dẹp các file vừa tải lên nếu DB lưu thất bại
      if (uploadedAudioPublicId) {
        await SongController.deleteFromCloudinary(uploadedAudioPublicId, "video");
      }
      if (uploadedCoverPublicId) {
        await SongController.deleteFromCloudinary(uploadedCoverPublicId, "image");
      }
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

  async toggleVisibility(req, res) {
    try {
      const response = await SongService.toggleVisibility(req.params.id);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { songIds } = req.body;
      if (!songIds || !Array.isArray(songIds)) {
        return res.status(400).json({ error: "Thiếu danh sách songIds" });
      }
      const response = await SongService.bulkDelete(songIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async bulkToggleVisibility(req, res) {
    try {
      const { songIds } = req.body;
      if (!songIds || !Array.isArray(songIds)) {
        return res.status(400).json({ error: "Thiếu danh sách songIds" });
      }
      const response = await SongService.bulkToggleVisibility(songIds);
      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
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
        const { page, limit, search } = req.query;
        if (page || limit || search) {
          const result = await SongService.getAllSongsWithFeaturePaginated({
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            search: search || "",
          });
          return res.status(200).json({
            success: true,
            data: result.data,
            pagination: {
              total: result.total,
              page: result.page,
              limit: result.limit,
              totalPages: result.totalPages,
            },
          });
        }
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