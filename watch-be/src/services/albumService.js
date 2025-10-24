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

  // 🟢 Lấy chi tiết album (kèm bài hát)
  async getAlbumById(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    const songs = await AlbumSongRepository.getSongsByAlbum(albumId);
    return { ...album, songs };
  },

  // 🟢 Lấy tất cả album của 1 ca sĩ
  async getAlbumsBySinger(singerId) {
    return await AlbumRepository.findBySingerId(singerId);
  },

  // 🟢 Tạo album mới
  async createAlbum(data, file) {
    if (!data.name) throw new Error("Tên album không được để trống");

    const singer = await SingerRepository.findById(data.singerId);
    if (!singer) throw new Error("Ca sĩ không tồn tại");

    // 🖼 Upload ảnh lên Cloudinary
    let coverUrl = data.coverUrl || null;
    if (file) {
      try {
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { folder: "albums", resource_type: "image" }
        );
        coverUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("❌ Lỗi upload Cloudinary:", err.message);
        throw new Error("Không thể tải ảnh lên Cloudinary");
      }
    }

    const albumId = ulid();
    await AlbumRepository.create({
      ...data,
      albumId,
      coverUrl,
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

    // 🖼 Upload ảnh mới nếu có
    if (file) {
      try {
        const base64 = file.buffer.toString("base64");
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${base64}`,
          { folder: "albums", resource_type: "image" }
        );
        data.coverUrl = uploadRes.secure_url;
      } catch (err) {
        console.error("❌ Lỗi upload Cloudinary:", err.message);
        throw new Error("Không thể tải ảnh mới lên Cloudinary");
      }
    }

    const success = await AlbumRepository.update(albumId, data);
    if (!success) throw new Error("Cập nhật thất bại");

    return { message: "Cập nhật album thành công" };
  },

  // 🟢 Xóa album (và liên kết bài hát)
  async deleteAlbum(albumId) {
    const album = await AlbumRepository.findById(albumId);
    if (!album) throw new Error("Album không tồn tại");

    // Xóa các bài hát trong album
    await AlbumSongRepository.updateAlbumSongs(albumId, []);

    const success = await AlbumRepository.delete(albumId);
    if (!success) throw new Error("Xóa thất bại");

    return { message: "Đã xóa album thành công" };
  },
};

module.exports = AlbumService;
