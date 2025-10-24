const { ulid } = require("ulid");
const cloudinary = require("../utils/config/cloudinary");
const AlbumRepository = require("../infras/repositories/albumRepository");
const SingerRepository = require("../infras/repositories/singerRepository");
const AlbumSongRepository = require("../infras/repositories/albumSongRepository");

const AlbumService = {
  // 🟢 Lấy tất cả album
  async getAllAlbums() {
    return await AlbumRepository.findAll();
  },

  // 🟢 Lấy chi tiết album kèm bài hát
  async getAlbumById(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return { ...album, songs };
  },

  // 🟢 Lấy danh sách album theo ca sĩ
  async getAlbumsBySinger(singerId) {
    const singer = await SingerRepository.findById(singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    return await AlbumRepository.findBySingerId(singerId);
  },

  // 🟢 Upload ảnh bìa lên Cloudinary
  async uploadCover(file) {
    if (!file) return null;
    try {
      const base64 = file.buffer.toString("base64");
      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${base64}`,
        { folder: "albums", resource_type: "image" }
      );
      return uploadRes.secure_url;
    } catch (err) {
      console.error("❌ Lỗi upload Cloudinary:", err.message);
      throw new Error("Không thể tải ảnh lên Cloudinary");
    }
  },

  // 🟢 Tạo album mới
  async createAlbum(data, file) {
    if (!data.name?.trim()) throw new Error("Tên album không được để trống");

    const singer = await SingerRepository.findById(data.singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    const coverUrl = await this.uploadCover(file);

    const albumId = ulid();
    await AlbumRepository.create({
      albumId,
      name: data.name.trim(),
      singerId: data.singerId,
      coverUrl,
      description: data.description || null,
      totalViews: 0,
      releaseDate: data.releaseDate || null,
    });

    return { message: "Tạo album thành công", albumId };
  },

  // 🟢 Cập nhật album
  async updateAlbum(albumId, data, file) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    if (data.singerId) {
      const singer = await SingerRepository.findById(data.singerId);
      if (!singer) throw new Error("Ca sĩ không tồn tại");
    }

    if (file) {
      data.coverUrl = await this.uploadCover(file);
    }

    const success = await AlbumRepository.update(albumId, data);
    if (!success) throw new Error("Cập nhật album thất bại");

    return { message: "Cập nhật album thành công" };
  },

  // 🟢 Xóa album (và toàn bộ bài hát liên kết)
  async deleteAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // Xóa tất cả liên kết trong AlbumSong
    await AlbumSongRepository.updateAlbumSongs(albumId, []);

    const success = await AlbumRepository.delete(albumId);
    if (!success) throw new Error("Xóa album thất bại");

    return { message: "Đã xóa album thành công" };
  },
};

module.exports = AlbumService;
