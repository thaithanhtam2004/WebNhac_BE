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

<<<<<<< HEAD
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
=======
  static normalizeDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString + "T12:00:00");
    return date.toISOString().split("T")[0];
  }

  async create(req, res) {
    try {
      const { title, lyric, singerId, genreId, releaseDate } = req.body;

      // Validation
      if (!title?.trim())
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng nhập tên bài hát" });
      if (!singerId)
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng chọn nghệ sĩ" });
      if (!genreId)
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng chọn thể loại" });
      if (!req.files?.file?.[0])
        return res
          .status(400)
          .json({ success: false, message: "Vui lòng upload file nhạc" });
>>>>>>> 04060ea (album user)

      let fileUrl = "";
      let coverUrl = "";
      let duration = 0;

<<<<<<< HEAD
      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = uploadRes.secure_url;

        // Tính duration từ file audio
        try {
          const metadata = await musicMetadata.parseBuffer(file.buffer, {
            mimeType: file.mimetype,
          });
          duration = Math.round(metadata.format.duration || 0);
        } catch (metaErr) {
          console.error("⚠️ Không thể đọc metadata:", metaErr.message);
        }
=======
      // Upload file nhạc
      const file = req.files.file[0];
      const fileBase64 = file.buffer.toString("base64");
      const uploadFileRes = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${fileBase64}`,
        { resource_type: "video", folder: "songs" }
      );
      fileUrl = uploadFileRes.secure_url;

      // Lấy duration
      try {
        const metadata = await musicMetadata.parseBuffer(file.buffer, {
          mimeType: file.mimetype,
        });
        duration = Math.round(metadata.format.duration || 0);
      } catch (metaErr) {
        console.warn("⚠️ Không thể đọc metadata:", metaErr.message);
>>>>>>> 04060ea (album user)
      }

      // Upload cover nếu có
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const coverBase64 = cover.buffer.toString("base64");
        const uploadCoverRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${coverBase64}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = uploadCoverRes.secure_url;
      }

<<<<<<< HEAD
=======
      const normalizedDate = SongController.normalizeDate(releaseDate);

>>>>>>> 04060ea (album user)
      const result = await SongService.createSong({
        title,
        duration,
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,
<<<<<<< HEAD
        releaseDate: releaseDate || null,
        popularityScore: popularityScore || 0,
=======
        releaseDate: normalizedDate,
>>>>>>> 04060ea (album user)
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
<<<<<<< HEAD
      const {
        title,
        duration,
        lyric,
        singerId,
        genreId,
        releaseDate,
        popularityScore,
      } = req.body;
=======
      const { title, lyric, singerId, genreId, releaseDate, popularityScore } =
        req.body;
>>>>>>> 04060ea (album user)
      const songId = req.params.id;

      const existing = await SongService.getSongById(songId);
      if (!existing)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy bài hát" });

      let fileUrl = existing.fileUrl;
      let coverUrl = existing.coverUrl;
      let newDuration = existing.duration;

      // Update file nhạc nếu có
      if (req.files?.file?.[0]) {
        const file = req.files.file[0];
        const fileBase64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${fileBase64}`,
          { resource_type: "video", folder: "songs" }
        );
        fileUrl = uploadRes.secure_url;

        // Tính duration mới
        try {
          const metadata = await musicMetadata.parseBuffer(file.buffer, {
            mimeType: file.mimetype,
          });
          newDuration = Math.round(metadata.format.duration || 0);
        } catch (metaErr) {
          console.warn("⚠️ Không thể đọc metadata:", metaErr.message);
        }
      }

      // Update cover nếu có
      if (req.files?.cover?.[0]) {
        const cover = req.files.cover[0];
        const coverBase64 = cover.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${cover.mimetype};base64,${coverBase64}`,
          { resource_type: "image", folder: "covers" }
        );
        coverUrl = uploadRes.secure_url;
      }

<<<<<<< HEAD
=======
      // Normalize releaseDate
      const finalReleaseDate =
        releaseDate !== undefined && releaseDate !== null && releaseDate !== ""
          ? SongController.normalizeDate(releaseDate)
          : existing.releaseDate;

>>>>>>> 04060ea (album user)
      const result = await SongService.updateSong(songId, {
        title,
        duration: newDuration,
        lyric: lyric || "",
        singerId,
        genreId,
        fileUrl,
        coverUrl,
<<<<<<< HEAD
        releaseDate,
        popularityScore,
=======
        releaseDate: finalReleaseDate,
        popularityScore: popularityScore ?? existing.popularityScore,
>>>>>>> 04060ea (album user)
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
      const result = await SongService.increaseView(req.params.id);
      res.status(200).json({ success: true, message: result.message });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
<<<<<<< HEAD
=======

  async getSongByReleaseDate(req, res) {
    try {
      const songs = await SongService.getSongByReleaseDate();
      res.status(200).json({ success: true, data: songs });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
>>>>>>> 04060ea (album user)
}

module.exports = new SongController();
